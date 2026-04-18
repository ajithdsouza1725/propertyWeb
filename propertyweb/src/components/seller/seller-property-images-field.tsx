"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, apiUploadSellerFile, getApiErrorMessage, mediaAbsoluteUrl } from "@/lib/api";

export function SellerPropertyImagesField({
  token,
  propertyId,
  imageUrls,
  onChange,
  disabled,
}: {
  token: string | null;
  propertyId: number | null;
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked = disabled || !token || uploading;

  return (
    <div className="grid gap-3">
      <div className="text-xs font-medium text-muted-foreground">Photos</div>
      <p className="text-xs text-muted-foreground">
        Images are stored on the API server. After you create a listing, uploads are attached automatically.
      </p>
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">{error}</div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={blocked}
          onChange={async (e) => {
            const files = e.target.files;
            e.target.value = "";
            if (!token || !files?.length || disabled) return;
            setError(null);
            setUploading(true);
            try {
              const uploaded: string[] = [];
              for (const file of Array.from(files)) {
                const { url } = await apiUploadSellerFile(token, file);
                uploaded.push(url);
              }
              if (propertyId != null && uploaded.length) {
                await apiFetch(`/api/seller/properties/${propertyId}/images`, {
                  token,
                  body: { urls: uploaded },
                });
              }
              onChange([...imageUrls, ...uploaded]);
            } catch (err: unknown) {
              setError(getApiErrorMessage(err, "Upload failed"));
            } finally {
              setUploading(false);
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={blocked} onClick={() => inputRef.current?.click()}>
          {uploading ? "Uploading…" : "Add photos"}
        </Button>
      </div>
      {imageUrls.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {imageUrls.map((u) => (
            <div key={u} className="relative aspect-4/3 overflow-hidden rounded-lg border bg-muted/30">
              <img src={mediaAbsoluteUrl(u)} alt="" className="size-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
          No photos yet. Add at least one clear exterior + interior shot for faster approval.
        </div>
      )}
    </div>
  );
}
