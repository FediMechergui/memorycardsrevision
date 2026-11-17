import { mkdirSync, writeFileSync } from "node:fs";
import immersiveCourses from "../content/immersive-courses.json";
import immersiveExercises from "../content/immersive-exercises.json";
import aiFoundations from "../content/ai-foundations.json";
import aiMethods from "../content/ai-methods.json";
import { parseCatalog } from "../src/lib/content";
const catalog = parseCatalog({
  schemaVersion: 1,
  edition: "s1-2026",
  version: 3,
  updatedAt: "2026-11-17",
  subjects: [
    {
      id: "realites-immersives", title: "Réalités immersives",
      subtitle: "Réalité augmentée, virtuelle et travaux dirigés",
      description: "Les quatre cours et les quatre TD fournis : comprendre, calculer et préparer des expériences augmentées.",
      category: "3D & IMMERSION", monogram: "3D", color: "mint", icon: "cube",
      sources: [
        { title: "Complément · Azuma, définition de la RA", url: "https://vs.inf.ethz.ch/edu/SS2005/DS/papers/ar/ARpresence.pdf" },
        { title: "Vérification · Optique de HoloLens 2", url: "https://learn.microsoft.com/en-us/hololens/hololens2-hardware" },
        { title: "TD4 · Vuforia dans Unity", url: "https://developer.vuforia.com/library/vuforia-engine/getting-started/development-environments/getting-started-vuforia-engine-unity/" },
        { title: "TD4 · Reconnaissance des Image Targets", url: "https://developer.vuforia.com/library/vuforia-engine/images-and-objects/image-targets/image-targets/" },
        { title: "TD4 · Bases Device, Cloud et VuMark", url: "https://developer.vuforia.com/library/vuforia-engine/images-and-objects/image-targets/device-databases/comparison-device-and-cloud-databases/" },
        { title: "TD4 · Conversion radians vers degrés", url: "https://docs.unity3d.com/ScriptReference/Mathf.Rad2Deg.html" },
        { title: "TD4 · Chargement des scènes Unity", url: "https://docs.unity.com/en-us/engine/6000.6/script-reference/unityengine/scenemanagement/scenemanager/loadscene" },
      ],
      chapters: [...immersiveCourses, ...immersiveExercises],
    },
    {
      id: "intelligence-artificielle", title: "Intelligence artificielle",
      subtitle: "Fondements, données et Machine Learning",
      description: "Les trois cours fournis, organisés en huit chapitres : de la définition de l’IA aux calculs de KNN et d’arbres de décision.",
      category: "IA & DONNÉES", monogram: "IA", color: "lavender", icon: "brain",
      sources: [
        { title: "Complément · Prétraitement sans fuite de données", url: "https://scikit-learn.org/stable/common_pitfalls.html" },
        { title: "Vérification · Définition et limites de R²", url: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.r2_score.html" },
        { title: "Documentation · Voisins les plus proches", url: "https://scikit-learn.org/stable/modules/neighbors.html" },
        { title: "Documentation · Arbres de décision", url: "https://scikit-learn.org/stable/modules/tree.html" },
      ],
      chapters: [...aiFoundations, ...aiMethods],
    },
  ],
});
mkdirSync("public/courses", { recursive: true });
writeFileSync(
  "public/courses/catalog.json",
  JSON.stringify(catalog, null, 2) + "\n",
  "utf8",
);
console.log("Catalogue Mémora généré.");
