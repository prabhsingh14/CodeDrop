import AdmZip from "adm-zip";

export const extractZip = (zipPath, destination) => {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(destination, true);
};