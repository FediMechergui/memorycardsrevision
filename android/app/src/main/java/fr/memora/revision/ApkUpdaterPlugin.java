package fr.memora.revision;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "ApkUpdater")
public class ApkUpdaterPlugin extends Plugin {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean downloading = new AtomicBoolean(false);
    private static final long MAX_BYTES = 150L * 1024 * 1024;
    private static final Set<String> HOSTS = new HashSet<>(Arrays.asList(
        "github.com", "objects.githubusercontent.com", "release-assets.githubusercontent.com", "objects-origin.githubusercontent.com"
    ));

    @PluginMethod public void install(PluginCall call) {
        String url = call.getString("url", "");
        String hash = call.getString("sha256", "");
        String repo = call.getString("repository", "");
        if (!repo.matches("[A-Za-z0-9][A-Za-z0-9-]{0,38}/[A-Za-z0-9][A-Za-z0-9._-]{0,99}") ||
            !url.startsWith("https://github.com/" + repo + "/releases/download/") || !hash.matches("[a-f0-9]{64}")) {
            call.reject("Origine ou empreinte de la mise à jour invalide."); return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getContext().getPackageManager().canRequestPackageInstalls()) {
            Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
            getActivity().startActivity(settings);
            call.reject("Autorise Mémora à installer des applications, puis reviens et touche à nouveau Télécharger et installer."); return;
        }
        if (!downloading.compareAndSet(false, true)) { call.reject("Un téléchargement est déjà en cours."); return; }
        executor.execute(() -> {
            File target = null;
            try {
                File directory = new File(getContext().getCacheDir(), "updates");
                if (!directory.isDirectory() && !directory.mkdirs()) throw new Exception("Stockage temporaire indisponible.");
                target = new File(directory, "memora-update.apk");
                HttpURLConnection connection = openDownload(url);
                try {
                    if (connection.getContentLengthLong() > MAX_BYTES) throw new Exception("APK trop volumineux.");
                    MessageDigest digest = MessageDigest.getInstance("SHA-256");
                    try (InputStream in = connection.getInputStream(); FileOutputStream out = new FileOutputStream(target)) {
                        byte[] bytes = new byte[32768]; long total = 0; int count;
                        while ((count = in.read(bytes)) != -1) {
                            if (Thread.currentThread().isInterrupted()) throw new Exception("Téléchargement interrompu.");
                            total += count;
                            if (total > MAX_BYTES) throw new Exception("APK trop volumineux.");
                            digest.update(bytes, 0, count); out.write(bytes, 0, count);
                        }
                    }
                    StringBuilder actual = new StringBuilder();
                    for (byte b : digest.digest()) actual.append(String.format("%02x", b & 0xff));
                    if (!MessageDigest.isEqual(actual.toString().getBytes(java.nio.charset.StandardCharsets.US_ASCII), hash.getBytes(java.nio.charset.StandardCharsets.US_ASCII))) {
                        throw new Exception("L’empreinte SHA-256 ne correspond pas. Le fichier a été rejeté.");
                    }
                } finally { connection.disconnect(); }
                verifyPackage(target);
                Uri file = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".updates", target);
                getActivity().runOnUiThread(() -> {
                    try {
                        Intent install = new Intent(Intent.ACTION_VIEW);
                        install.setDataAndType(file, "application/vnd.android.package-archive");
                        install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        getActivity().startActivity(install);
                        call.resolve();
                    } catch (Exception e) { call.reject("L’installateur Android n’a pas pu être ouvert.", e); }
                    finally { downloading.set(false); }
                });
            } catch (Exception e) {
                if (target != null && target.exists()) target.delete();
                downloading.set(false);
                call.reject(e.getMessage() == null ? "Téléchargement impossible. Vérifie la connexion." : e.getMessage(), e);
            }
        });
    }

    private HttpURLConnection openDownload(String address) throws Exception {
        URL url = new URL(address);
        for (int redirect = 0; redirect < 6; redirect++) {
            if (!"https".equals(url.getProtocol()) || !HOSTS.contains(url.getHost()) || url.getUserInfo() != null || (url.getPort() != -1 && url.getPort() != 443)) throw new Exception("Redirection de téléchargement non autorisée.");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setInstanceFollowRedirects(false); connection.setConnectTimeout(15000); connection.setReadTimeout(30000);
            connection.setRequestProperty("Accept", "application/octet-stream");
            int status = connection.getResponseCode();
            if (status >= 300 && status < 400) {
                String location = connection.getHeaderField("Location"); connection.disconnect();
                if (location == null) throw new Exception("Redirection invalide.");
                url = new URL(url, location); continue;
            }
            if (status != 200) { connection.disconnect(); throw new Exception("Téléchargement refusé : HTTP " + status); }
            return connection;
        }
        throw new Exception("Trop de redirections de téléchargement.");
    }

    @SuppressWarnings("deprecation") private void verifyPackage(File file) throws Exception {
        PackageManager manager = getContext().getPackageManager();
        int flags = Build.VERSION.SDK_INT >= 28 ? PackageManager.GET_SIGNING_CERTIFICATES : PackageManager.GET_SIGNATURES;
        PackageInfo next = manager.getPackageArchiveInfo(file.getAbsolutePath(), flags);
        PackageInfo current = manager.getPackageInfo(getContext().getPackageName(), flags);
        if (next == null || !current.packageName.equals(next.packageName)) throw new Exception("Cet APK n’est pas une mise à jour de Mémora.");
        long nextVersion = Build.VERSION.SDK_INT >= 28 ? next.getLongVersionCode() : next.versionCode;
        long currentVersion = Build.VERSION.SDK_INT >= 28 ? current.getLongVersionCode() : current.versionCode;
        if (nextVersion <= currentVersion) throw new Exception("La version Android téléchargée n’est pas plus récente.");
        Signature[] nextSignatures = Build.VERSION.SDK_INT >= 28 && next.signingInfo != null ? next.signingInfo.getApkContentsSigners() : next.signatures;
        Signature[] currentSignatures = Build.VERSION.SDK_INT >= 28 && current.signingInfo != null ? current.signingInfo.getApkContentsSigners() : current.signatures;
        if (nextSignatures == null || currentSignatures == null || !new HashSet<>(Arrays.asList(currentSignatures)).equals(new HashSet<>(Arrays.asList(nextSignatures)))) {
            throw new Exception("La signature ne correspond pas à l’application installée. Utilise le même canal et la même clé de signature.");
        }
    }

    @Override protected void handleOnDestroy() { executor.shutdownNow(); }
}
