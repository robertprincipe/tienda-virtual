import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  sku: string;
}

interface LowStockTableProps {
  products: LowStockProduct[];
}

export function LowStockTable({ products }: LowStockTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos con Bajo Stock</CardTitle>
        <CardDescription>
          Productos que necesitan reabastecimiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  No hay productos con bajo stock
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        product.stock === 0 ? "destructive" : "secondary"
                      }
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
