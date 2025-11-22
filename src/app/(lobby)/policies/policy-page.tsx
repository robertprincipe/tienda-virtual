import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface PolicyPageContentProps {
  title: string;
  description: string;
  content?: string | null;
}

const PolicyPageContent = ({
  title,
  description,
  content,
}: PolicyPageContentProps) => {
  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8 space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          <Link href="/">
            <Button variant="ghost" size="sm">
              &larr; Volver al inicio
            </Button>
          </Link>
        </p>
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Última actualización</CardTitle>
          <p className="text-sm text-muted-foreground">
            Esta información es administrada por el equipo de la tienda.
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="prose prose-slate dark:prose-invert max-w-none">
          {content ? (
            <div>{content}</div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-semibold">
                Pronto agregaremos este contenido
              </p>
              <p className="text-sm">
                Estamos preparando la información para compartirla contigo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyPageContent;
