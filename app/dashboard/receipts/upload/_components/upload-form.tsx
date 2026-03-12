"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { Upload01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { uploadReceipt } from "../../../../lib/actions/receipts";
import { uploadReceiptSchema } from "../../../../lib/validations/receipt";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

interface UploadFormProps {
  userId: string;
}

export function UploadForm({ userId }: UploadFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      file: undefined as File | undefined,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      
      if (!value.file) {
        setError("Por favor selecciona un archivo");
        toast.error("Por favor selecciona un archivo");
        return;
      }

      toast.loading("Subiendo recibo...", { id: "upload" });

      const formData = new FormData();
      formData.append("file", value.file);

      const result = await uploadReceipt(formData, userId);

      if (result.error) {
        let errorMessage = result.error;
        if (result.details) {
          errorMessage += ` (${JSON.stringify(result.details)})`;
        }
        setError(errorMessage);
        toast.error(errorMessage, { id: "upload" });
        throw new Error(result.error);
      }

      toast.success("Recibo subido exitosamente", { id: "upload" });
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/receipts");
      }, 1500);
    },
  });

  const handleFileReject = (file: File, message: string) => {
    setError(message);
  };

  const handleFileValidate = (file: File): string | null | undefined => {
    if (file.size > MAX_FILE_SIZE) {
      return "El archivo no puede exceder 10MB";
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Tipo de archivo no permitido. Usa: JPEG, PNG, WebP o PDF";
    }
    return null;
  };

  const files = form.getFieldValue("file") ? [form.getFieldValue("file")!] : [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldGroup className="space-y-6">
          {(error || success) && (
            <div
              className={`p-4 rounded-md ${
                success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {success ? "Receipt uploaded! Redirecting to list..." : error}
            </div>
          )}

          <form.Field
            name="file"
            validators={{
              onChange: uploadReceiptSchema.shape.file,
            }}
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="mb-2">
                    Select Image or PDF
                  </FieldLabel>
                  <FileUpload
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    maxSize={MAX_FILE_SIZE}
                    maxFiles={1}
                    value={files}
                    onValueChange={(value) => {
                      setError(null);
                      field.handleChange(value[0]);
                    }}
                    onFileReject={handleFileReject}
                    onFileValidate={handleFileValidate}
                  >
                    <FileUploadDropzone>
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex items-center justify-center rounded-full border p-2.5">
                          <HugeiconsIcon
                            icon={Upload01Icon}
                            size={24}
                            className="text-muted-foreground"
                          />
                        </div>
                        <p className="font-medium text-sm">
                          Drag & drop files here
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Or click to browse (max 1 file, up to 10MB each)
                        </p>
                      </div>
                      <FileUploadTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2 w-fit">
                          Browse files
                        </Button>
                      </FileUploadTrigger>
                    </FileUploadDropzone>
                    <FileUploadList forceMount>
                      {files.map((file, index) => (
                        <FileUploadItem key={index} value={file}>
                          <div className="flex w-full items-start gap-3">
                            <FileUploadItemPreview className="size-12 rounded-md">
                              {file.type.startsWith("image/") && (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="size-full object-cover"
                                />
                              )}
                            </FileUploadItemPreview>
                            <div className="flex flex-1 items-start justify-between gap-2">
                              <FileUploadItemMetadata size="sm" />
                              <FileUploadItemDelete asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 shrink-0"
                                >
                                  <HugeiconsIcon
                                    icon={Delete01Icon}
                                    size={16}
                                  />
                                </Button>
                              </FileUploadItemDelete>
                            </div>
                          </div>
                        </FileUploadItem>
                      ))}
                    </FileUploadList>
                  </FileUpload>
                  <p className="text-sm text-muted-foreground mt-1">
                    Accepted formats: JPEG, PNG, WebP, PDF (max 10MB)
                  </p>
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={form.state.isSubmitting}
              className="flex-1"
            >
              {form.state.isSubmitting ? "Uploading..." : "Upload Receipt"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/receipts")}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
