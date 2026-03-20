"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Document } from "@/types";
import { formatDate } from "@/lib/utils";
import { uploadDocument, deleteDocument } from "@/actions/documents";
import { FileText, Upload, ExternalLink, Trash2 } from "lucide-react";

function DocumentRow({ doc, caseId }: { doc: Document; caseId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteDocument(doc.id, caseId, doc.file_url);
      router.refresh();
    });
  }

  return (
    <div className="group flex items-center justify-between rounded-lg border p-3.5 hover:bg-accent/40 transition-colors">
      <a
        href={doc.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 min-w-0 flex-1"
      >
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{doc.document_type}</p>
          <p className="text-xs text-muted-foreground">
            Uploaded by {doc.uploaded_by} · {formatDate(doc.created_at)}
          </p>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
      </a>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 rounded hover:bg-accent text-muted-foreground hover:text-destructive shrink-0"
        title="Delete document"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function DocumentsList({ documents, caseId }: { documents: Document[]; caseId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [documentType, setDocumentType] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !documentType.trim() || !uploadedBy.trim()) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType.trim());
    formData.append("uploaded_by", uploadedBy.trim());

    startTransition(async () => {
      await uploadDocument(caseId, formData);
      router.refresh();
    });
    e.target.value = "";
  }

  const canUpload = documentType.trim() && uploadedBy.trim();

  return (
    <div className="space-y-4">
      {/* Upload form */}
      <div className="rounded-lg border p-4 space-y-3">
        <p className="text-sm font-medium">Upload Document</p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Document type (e.g. Lab Results)"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          />
          <Input
            placeholder="Your name"
            value={uploadedBy}
            onChange={(e) => setUploadedBy(e.target.value)}
          />
        </div>
        <label className={!canUpload ? "opacity-50 pointer-events-none w-fit block" : "w-fit block"}>
          <Button asChild size="sm" variant="outline" disabled={isPending || !canUpload}>
            <span>
              <Upload className="h-4 w-4" />
              {isPending ? "Uploading..." : "Choose File"}
            </span>
          </Button>
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={isPending || !canUpload}
          />
        </label>
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No documents uploaded.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} caseId={caseId} />
          ))}
        </div>
      )}
    </div>
  );
}
