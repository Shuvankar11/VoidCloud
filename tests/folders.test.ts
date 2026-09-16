import { describe, it, expect, beforeEach } from 'vitest';
import { VaultFolder, ShieldedFile } from '../src/types';

describe('VoidCloud Directory & Folder Hierarchy Unit Tests', () => {
  let folders: VaultFolder[];
  let files: ShieldedFile[];

  beforeEach(() => {
    folders = [];
    files = [
      {
        id: 'file-1',
        name: 'zk-contract-audit.pdf',
        sizeBytes: 1024 * 500,
        uploadedAt: Date.now(),
        commitment: '0xabc123',
        status: 'shielded',
        isStarred: false,
        folderId: undefined,
      },
      {
        id: 'file-2',
        name: 'midnight-zk-proof.json',
        sizeBytes: 1024 * 80,
        uploadedAt: Date.now(),
        commitment: '0xdef456',
        status: 'shielded',
        isStarred: true,
        folderId: undefined,
      },
    ];
  });

  const createFolder = (
    name: string,
    color: string = 'indigo',
    parentId?: string
  ): VaultFolder => {
    const newFolder: VaultFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      color,
      parentId: parentId || undefined,
      createdAt: Date.now(),
    };
    folders.push(newFolder);
    return newFolder;
  };

  const resolveBreadcrumbPath = (
    folderId: string | null,
    allFolders: VaultFolder[]
  ): VaultFolder[] => {
    const path: VaultFolder[] = [];
    let currentId = folderId;

    while (currentId) {
      const folder = allFolders.find((f) => f.id === currentId);
      if (!folder) break;
      path.unshift(folder);
      currentId = folder.parentId || null;
    }

    return path;
  };

  const moveFile = (
    fileId: string,
    targetFolderId: string | null
  ): boolean => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return false;
    file.folderId = targetFolderId || undefined;
    return true;
  };

  const deleteFolderCascade = (folderId: string): void => {
    const getDescendantFolderIds = (id: string): string[] => {
      const children = folders.filter((f) => f.parentId === id);
      return [id, ...children.flatMap((c) => getDescendantFolderIds(c.id))];
    };

    const targetIds = getDescendantFolderIds(folderId);

    // Reassign files in deleted folders back to root
    files.forEach((file) => {
      if (file.folderId && targetIds.includes(file.folderId)) {
        file.folderId = undefined;
      }
    });

    // Remove deleted folders
    folders = folders.filter((f) => !targetIds.includes(f.id));
  };

  it('creates root folders with specified color themes', () => {
    const folderA = createFolder('Finance Docs', 'emerald');
    const folderB = createFolder('Smart Contracts', 'sky');

    expect(folders.length).toBe(2);
    expect(folderA.name).toBe('Finance Docs');
    expect(folderA.color).toBe('emerald');
    expect(folderA.parentId).toBeUndefined();

    expect(folderB.name).toBe('Smart Contracts');
    expect(folderB.color).toBe('sky');
  });

  it('supports multi-level nested folders (folder in folder)', () => {
    const parent = createFolder('Engineering', 'indigo');
    const child = createFolder('Preprod Deployments', 'purple', parent.id);
    const grandchild = createFolder('Artifacts 2026', 'amber', child.id);

    expect(folders.length).toBe(3);
    expect(child.parentId).toBe(parent.id);
    expect(grandchild.parentId).toBe(child.id);

    const breadcrumb = resolveBreadcrumbPath(grandchild.id, folders);
    expect(breadcrumb.length).toBe(3);
    expect(breadcrumb[0].name).toBe('Engineering');
    expect(breadcrumb[1].name).toBe('Preprod Deployments');
    expect(breadcrumb[2].name).toBe('Artifacts 2026');
  });

  it('moves files into folders and resets back to root', () => {
    const folder = createFolder('Audits', 'indigo');

    const moved = moveFile('file-1', folder.id);
    expect(moved).toBe(true);
    expect(files[0].folderId).toBe(folder.id);

    // Reset back to root
    moveFile('file-1', null);
    expect(files[0].folderId).toBeUndefined();
  });

  it('cascades folder deletion and restores contained files to root level', () => {
    const parent = createFolder('Security', 'rose');
    const child = createFolder('Private Keys', 'rose', parent.id);

    moveFile('file-1', parent.id);
    moveFile('file-2', child.id);

    expect(files[0].folderId).toBe(parent.id);
    expect(files[1].folderId).toBe(child.id);

    // Delete parent folder
    deleteFolderCascade(parent.id);

    // Both parent and child should be removed
    expect(folders.find((f) => f.id === parent.id)).toBeUndefined();
    expect(folders.find((f) => f.id === child.id)).toBeUndefined();

    // Files should safely fall back to root
    expect(files[0].folderId).toBeUndefined();
    expect(files[1].folderId).toBeUndefined();
  });
});
