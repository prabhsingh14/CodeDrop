import folderHash from 'folder-hash';

export const hashFolder = async (dirPath) => {
    const result = await folderHash.hashElement(dirPath, {
        folders: { exclude: ['node_modules', '.git'] },
    });
    
    return result.hash;
};
