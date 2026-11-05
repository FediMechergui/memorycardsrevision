import { X } from "@phosphor-icons/react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Toast } from "./UI";
export function PwaUpdates() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });
  return (
    <>
      {offlineReady && (
        <Toast onClose={() => setOfflineReady(false)}>
          Mémora est prête pour tes révisions hors connexion.
        </Toast>
      )}
      {needRefresh && (
        <div className="sw-update" role="status">
          <span>Une nouvelle version du site est prête.</span>
          <button
            className="button primary"
            onClick={() => updateServiceWorker(true)}
          >
            Actualiser
          </button>
          <button
            className="icon-button"
            aria-label="Plus tard"
            onClick={() => setNeedRefresh(false)}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}
