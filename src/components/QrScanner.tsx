import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera } from "@phosphor-icons/react";
import { Modal } from "./UI";
export function QrScanner({
  onRead,
  onClose,
}: {
  onRead: (value: string) => void;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState(""),
    [error, setError] = useState(""),
    [camera, setCamera] = useState(false);
  const callback = useRef(onRead);
  callback.current = onRead;
  useEffect(() => {
    if (!camera) return;
    let disposed = false,
      stream: MediaStream | undefined,
      timer: ReturnType<typeof setTimeout>;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const scan = () => {
      if (disposed) return;
      const v = video.current;
      if (v?.videoWidth) {
        canvas.width = Math.min(v.videoWidth, 800);
        canvas.height = Math.round(
          (v.videoHeight * canvas.width) / v.videoWidth,
        );
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(data.data, data.width, data.height);
        if (qr) {
          callback.current(qr.data);
          setCamera(false);
          return;
        }
      }
      timer = setTimeout(scan, 180);
    };
    void (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error();
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (disposed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (video.current) {
          video.current.srcObject = stream;
          await video.current.play();
          scan();
        }
      } catch {
        setError(
          "Caméra indisponible. Autorise son accès, importe une image ou colle le code du joueur.",
        );
        setCamera(false);
      }
    })();
    return () => {
      disposed = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [camera]);
  return (
    <Modal title="Inviter un joueur" onClose={onClose}>
      <p>
        Scanne son QR personnel. Une invitation apparaîtra sur son appareil.
      </p>
      {camera ? (
        <video
          className="qr-video"
          ref={video}
          muted
          playsInline
          aria-label="Caméra pour scanner le QR"
        />
      ) : (
        <button
          className="button primary"
          onClick={() => {
            setError("");
            setCamera(true);
          }}
        >
          <Camera size={20} />
          Ouvrir la caméra
        </button>
      )}
      <label className="field">
        Ou importer une image QR
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              if (file.size > 8_000_000)
                throw new Error("Image trop grande (8 Mo maximum).");
              const bitmap = await createImageBitmap(file);
              const canvas = document.createElement("canvas");
              const scale = Math.min(
                1,
                1400 / Math.max(bitmap.width, bitmap.height),
              );
              canvas.width = Math.round(bitmap.width * scale);
              canvas.height = Math.round(bitmap.height * scale);
              const ctx = canvas.getContext("2d")!;
              ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
              bitmap.close();
              const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(img.data, img.width, img.height);
              if (!code) throw new Error("Aucun QR détecté dans cette image.");
              onRead(code.data);
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        />
      </label>
      <label className="field">
        Code personnel du joueur
        <textarea
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Colle le code affiché sous son QR"
        />
      </label>
      <button
        className="button secondary"
        disabled={!manual.trim()}
        onClick={() => onRead(manual.trim())}
      >
        Inviter avec ce code
      </button>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
    </Modal>
  );
}
