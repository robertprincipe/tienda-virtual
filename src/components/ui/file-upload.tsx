import {
  FileIcon,
  FileText,
  Film,
  ImageIcon,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FileWithPreview extends File {
  preview?: string;
}

export interface ExistingFile {
  url: string;
  name: string;
  type?: string;
}

interface FileUploadProps {
  // Control del componente
  value?: FileWithPreview[] | File[];
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;

  // Archivos existentes (para edición)
  existingFiles?: ExistingFile[];
  onDeleteExisting?: (file: ExistingFile) => void;

  // Configuración
  maxFiles?: number;
  maxSize?: number; // en bytes (default: 2MB)
  accept?: Record<string, string[]>;
  disabled?: boolean;
  required?: boolean;

  // Estilos y texto
  className?: string;
  label?: string;
  description?: string;
  error?: string;

  // Modo de visualización
  variant?: "default" | "compact";
}

export function FileUpload({
  value = [],
  onChange,
  onError,
  existingFiles = [],
  onDeleteExisting,
  maxFiles = 1,
  maxSize = 2 * 1024 * 1024, // 2MB por defecto
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  },
  disabled = false,
  required = false,
  className,
  label,
  description,
  error,
  variant = "default",
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  // Sincronizar con value externo
  useEffect(() => {
    if (value && value.length > 0) {
      const filesWithPreview = Array.from(value).map((file) => {
        const fileWithPreview = file as FileWithPreview;
        if (!fileWithPreview.preview && file.type.startsWith("image/")) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        return fileWithPreview;
      });
      setFiles(filesWithPreview);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Manejar archivos rechazados
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        let errorMessage = "Error al subir archivo";

        if (error.code === "file-too-large") {
          errorMessage = `El archivo es demasiado grande. Máximo ${(
            maxSize /
            (1024 * 1024)
          ).toFixed(0)}MB`;
        } else if (error.code === "file-invalid-type") {
          errorMessage = "Tipo de archivo no permitido";
        } else if (error.code === "too-many-files") {
          errorMessage = `Máximo ${maxFiles} archivo(s)`;
        }

        onError?.(errorMessage);
        return;
      }

      // Validar número máximo de archivos
      const totalFiles =
        files.length + existingFiles.length + acceptedFiles.length;
      if (totalFiles > maxFiles) {
        onError?.(`Máximo ${maxFiles} archivo(s) permitido(s)`);
        return;
      }

      // Crear previews para imágenes
      const filesWithPreview = acceptedFiles.map((file) => {
        const fileWithPreview = file as FileWithPreview;
        if (file.type.startsWith("image/")) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        return fileWithPreview;
      });

      const newFiles = [...files, ...filesWithPreview];
      setFiles(newFiles);
      onChange?.(newFiles);
    },
    [files, existingFiles, maxFiles, maxSize, onChange, onError]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      maxFiles: maxFiles - files.length - existingFiles.length,
      maxSize,
      accept,
      disabled,
      multiple: maxFiles > 1,
    });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const removed = newFiles.splice(index, 1)[0];

    // Liberar URL del preview
    if (removed.preview) {
      URL.revokeObjectURL(removed.preview);
    }

    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const getFileIcon = (file: File | ExistingFile) => {
    const type = "type" in file ? file.type : "";

    if (type?.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8" />;
    }
    if (type?.startsWith("video/")) {
      return <Film className="h-8 w-8" />;
    }
    if (type === "application/pdf") {
      return <FileText className="h-8 w-8" />;
    }
    return <FileIcon className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const canAddMore = files.length + existingFiles.length < maxFiles;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      {/* Archivos existentes */}
      {existingFiles.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {existingFiles.map((file, index) => (
            <div
              key={index}
              className="relative group rounded-lg border border-border overflow-hidden"
            >
              {/* Preview de imagen */}
              {file.url &&
              (file.type?.startsWith("image/") ||
                file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-muted">
                  {getFileIcon(file)}
                </div>
              )}

              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteExisting?.(file)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>

              {/* Nombre del archivo */}
              <div className="p-2 bg-background">
                <p className="text-xs truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archivos nuevos */}
      {files.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group rounded-lg border border-border overflow-hidden"
            >
              {/* Preview según tipo de archivo */}
              {file.type.startsWith("image/") && file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-full h-48 object-cover"
                  onLoad={() => {
                    URL.revokeObjectURL(file.preview!);
                  }}
                />
              ) : file.type.startsWith("video/") && file.preview ? (
                <video
                  src={file.preview}
                  className="w-full h-48 object-cover"
                  controls
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 bg-muted">
                  {getFileIcon(file)}
                  <p className="text-xs mt-2 text-muted-foreground">
                    {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                  </p>
                </div>
              )}

              {/* Botón eliminar */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Info del archivo */}
              <div className="p-2 bg-background">
                <p className="text-xs truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            isDragActive && !isDragReject && "border-primary bg-primary/5",
            isDragReject && "border-destructive bg-destructive/5",
            !isDragActive && "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive",
            variant === "default" ? "p-8" : "p-4"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            {variant === "default" ? (
              <>
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive
                      ? "Suelta los archivos aquí"
                      : "Arrastra archivos o haz click para seleccionar"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Object.values(accept).flat().join(", ")} (máx.{" "}
                    {(maxSize / (1024 * 1024)).toFixed(0)}MB)
                  </p>
                  {maxFiles > 1 && (
                    <p className="text-xs text-muted-foreground">
                      Máximo {maxFiles} archivo(s)
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm">Click para seleccionar archivo</p>
            )}
          </div>
        </div>
      )}

      {!canAddMore && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Límite de archivos alcanzado ({maxFiles})
        </p>
      )}
    </div>
  );
}
