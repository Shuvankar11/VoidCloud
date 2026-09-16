import { describe, it, expect, beforeEach } from 'vitest';
import { ShieldedFile } from '../src/types';

describe('VoidCloud Batch Operations & Tag Management Unit Tests', () => {
  let files: ShieldedFile[];

  beforeEach(() => {
    files = [
      {
        id: 'f-1',
        name: 'invoice-sep-2026.pdf',
        sizeBytes: 1024 * 200,
        uploadedAt: 1726480000000,
        commitment: '0xcom1',
        status: 'shielded',
        isStarred: false,
        tags: ['Financial'],
      },
      {
        id: 'f-2',
        name: 'zk-proof-benchmark.mp4',
        sizeBytes: 1024 * 1024 * 15,
        uploadedAt: 1726481000000,
        commitment: '0xcom2',
        status: 'shielded',
        isStarred: false,
        tags: ['Media'],
      },
      {
        id: 'f-3',
        name: 'midnight-indexer-config.json',
        sizeBytes: 1024 * 4,
        uploadedAt: 1726482000000,
        commitment: '0xcom3',
        status: 'shielded',
        isStarred: true,
        tags: ['Confidential', 'Work'],
      },
    ];
  });

  const bulkStarFiles = (fileIds: string[], star: boolean) => {
    files.forEach((f) => {
      if (fileIds.includes(f.id)) {
        f.isStarred = star;
      }
    });
  };

  const bulkMoveToTrash = (fileIds: string[]) => {
    files.forEach((f) => {
      if (fileIds.includes(f.id)) {
        f.status = 'shredded';
      }
    });
  };

  const bulkMoveToFolder = (fileIds: string[], targetFolderId: string | null) => {
    files.forEach((f) => {
      if (fileIds.includes(f.id)) {
        f.folderId = targetFolderId || undefined;
      }
    });
  };

  const updateFileTags = (fileId: string, tags: string[]) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      file.tags = tags;
    }
  };

  const restoreAllTrash = () => {
    files.forEach((f) => {
      if (f.status === 'shredded') {
        f.status = 'shielded';
      }
    });
  };

  const emptyTrash = () => {
    files = files.filter((f) => f.status !== 'shredded');
  };

  it('performs bulk star and unstar on selected files', () => {
    bulkStarFiles(['f-1', 'f-2'], true);
    expect(files[0].isStarred).toBe(true);
    expect(files[1].isStarred).toBe(true);
    expect(files[2].isStarred).toBe(true);

    bulkStarFiles(['f-1', 'f-3'], false);
    expect(files[0].isStarred).toBe(false);
    expect(files[1].isStarred).toBe(true);
    expect(files[2].isStarred).toBe(false);
  });

  it('performs bulk move to trash and bulk restore', () => {
    bulkMoveToTrash(['f-1', 'f-2']);
    expect(files[0].status).toBe('shredded');
    expect(files[1].status).toBe('shredded');
    expect(files[2].status).toBe('shielded');

    restoreAllTrash();
    expect(files[0].status).toBe('shielded');
    expect(files[1].status).toBe('shielded');
  });

  it('permanently deletes shredded files on emptyTrash()', () => {
    bulkMoveToTrash(['f-1', 'f-3']);
    expect(files.filter((f) => f.status === 'shredded').length).toBe(2);

    emptyTrash();
    expect(files.length).toBe(1);
    expect(files[0].id).toBe('f-2');
  });

  it('moves multiple files to folder and queries by tag', () => {
    bulkMoveToFolder(['f-1', 'f-2'], 'folder-sep-cycle');
    expect(files[0].folderId).toBe('folder-sep-cycle');
    expect(files[1].folderId).toBe('folder-sep-cycle');
    expect(files[2].folderId).toBeUndefined();

    // Update tags
    updateFileTags('f-1', ['Financial', 'Audited', 'Preprod']);
    expect(files[0].tags).toEqual(['Financial', 'Audited', 'Preprod']);

    // Tag filtering
    const auditedFiles = files.filter((f) => f.tags?.includes('Audited'));
    expect(auditedFiles.length).toBe(1);
    expect(auditedFiles[0].id).toBe('f-1');
  });
});
