package fr.memora.revision;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "AppFiles")
public class AppFilesPlugin extends Plugin {
    @PluginMethod public void exportJson(PluginCall call) {
        String name = call.getString("name", "memora-export.json");
        String data = call.getString("data", "");
        if (!name.matches("[a-zA-Z0-9._-]+\\.json") || data.length() > 5_000_000) { call.reject("Fichier d’export invalide."); return; }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(call, intent, "writeExport");
    }
    @ActivityCallback private void writeExport(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) { call.resolve(); return; }
        Uri uri = result.getData().getData();
        if (uri == null) { call.reject("Destination indisponible."); return; }
        try (OutputStream output = getContext().getContentResolver().openOutputStream(uri)) {
            if (output == null) throw new Exception("Destination indisponible.");
            output.write(call.getString("data", "{}").getBytes(StandardCharsets.UTF_8));
            call.resolve();
        } catch (Exception e) { call.reject("Impossible d’enregistrer le fichier.", e); }
    }
}
