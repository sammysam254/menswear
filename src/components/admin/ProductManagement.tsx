import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  size: string | null;
  color: string | null;
  brand: string | null;
  image_url: string | null;
  stock_quantity: number;
  rating: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    size: "",
    color: "",
    brand: "",
    stock_quantity: "",
    rating: "0",
    is_featured: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            product_id,
            image_url,
            is_primary,
            display_order
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const files = event.target.files;
    console.log("Upload triggered, files:", files?.length);
    
    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }

    setUploading(true);
    console.log("Starting upload process...");
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        console.log(`Processing file ${index + 1}:`, file.name, file.type, file.size);
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log("Uploading to storage:", filePath);
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw uploadError;
        }

        console.log("File uploaded successfully, getting public URL...");
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        console.log("Public URL:", publicUrl);

        // Check if this is the first image to set as primary
        const { data: existingImages } = await supabase
          .from('product_images')
          .select('id')
          .eq('product_id', productId);

        const isPrimary = !existingImages || existingImages.length === 0 ? index === 0 : false;

        // Insert into product_images table
        const { error: insertError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: publicUrl,
            is_primary: isPrimary,
            display_order: index
          });

        if (insertError) throw insertError;

        // Update the main product table with the first image URL for backward compatibility
        if (isPrimary) {
          await supabase
            .from('products')
            .update({ image_url: publicUrl })
            .eq('id', productId);
        }

        return publicUrl;
      });

      await Promise.all(uploadPromises);
      
      toast({
        title: "Success",
        description: `${files.length} images uploaded successfully`,
      });
      
      fetchProducts();
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string, productId: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      // Update primary image if needed
      const { data: remainingImages } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');

      if (remainingImages && remainingImages.length > 0) {
        // Set first remaining image as primary
        await supabase
          .from('product_images')
          .update({ is_primary: true })
          .eq('id', remainingImages[0].id);

        // Update main product table
        await supabase
          .from('products')
          .update({ image_url: remainingImages[0].image_url })
          .eq('id', productId);
      } else {
        // No images left, clear main product image
        await supabase
          .from('products')
          .update({ image_url: null })
          .eq('id', productId);
      }

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      
      fetchProducts();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category: formData.category,
        size: formData.size || null,
        color: formData.color || null,
        brand: formData.brand || null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        rating: parseFloat(formData.rating) || 0,
        is_featured: formData.is_featured,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product added successfully",
        });
      }

      resetForm();
      fetchProducts();
      setIsAddDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      size: "",
      color: "",
      brand: "",
      stock_quantity: "",
      rating: "0",
      is_featured: false,
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category,
      size: product.size || "",
      color: product.color || "",
      brand: product.brand || "",
      stock_quantity: product.stock_quantity.toString(),
      rating: product.rating.toString(),
      is_featured: product.is_featured,
    });
    setIsAddDialogOpen(true);
  };

  if (loading) {
    return <div className="p-4">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Product Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (KES) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shoes">Shoes</SelectItem>
                      <SelectItem value="jeans">Jeans</SelectItem>
                      <SelectItem value="jackets">Jackets</SelectItem>
                      <SelectItem value="shorts">Shorts</SelectItem>
                      <SelectItem value="shirts">Shirts</SelectItem>
                      <SelectItem value="dresses">Dresses</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    placeholder="e.g. M, L, XL"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium line-clamp-2">{product.name}</CardTitle>
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Multiple Images Display */}
              <div className="mb-3">
                {product.product_images && product.product_images.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {product.product_images.slice(0, 4).map((img, index) => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.image_url}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteImage(img.id, product.id)}
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          {img.is_primary && (
                            <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground px-1 py-0.5 rounded text-xs">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {product.product_images.length > 4 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{product.product_images.length - 4} more images
                      </p>
                    )}
                  </div>
                ) : product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Images</span>
                  </div>
                )}
                
                {/* Upload Multiple Images */}
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      console.log("File input onChange triggered");
                      handleMultipleImageUpload(e, product.id);
                      // Reset the input value to allow selecting the same file again
                      e.target.value = '';
                    }}
                    className="hidden"
                    disabled={uploading}
                    id={`file-upload-${product.id}`}
                  />
                  <label htmlFor={`file-upload-${product.id}`} className="cursor-pointer">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      type="button"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload Images"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span>KES {product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span className="capitalize">{product.category}</span>
                </div>
                {product.size && (
                  <div className="flex justify-between">
                    <span className="font-medium">Size:</span>
                    <span>{product.size}</span>
                  </div>
                )}
                {product.color && (
                  <div className="flex justify-between">
                    <span className="font-medium">Color:</span>
                    <span>{product.color}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Stock:</span>
                  <span>{product.stock_quantity}</span>
                </div>
                {product.is_featured && (
                  <div className="text-center">
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProduct(product)}
                    className="w-full text-xs"
                  >
                    View Description
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {/* Display all images */}
              {selectedProduct.product_images && selectedProduct.product_images.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.product_images.map((img, index) => (
                      <div key={img.id} className="relative">
                        <img
                          src={img.image_url}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        {img.is_primary && (
                          <span className="absolute top-1 left-1 bg-primary text-primary-foreground px-1 py-0.5 rounded text-xs">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedProduct.image_url ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-500">No Images</span>
                </div>
              )}
              <div className="space-y-2">
                <div><strong>Price:</strong> KES {selectedProduct.price}</div>
                <div><strong>Category:</strong> {selectedProduct.category}</div>
                {selectedProduct.size && <div><strong>Size:</strong> {selectedProduct.size}</div>}
                {selectedProduct.color && <div><strong>Color:</strong> {selectedProduct.color}</div>}
                {selectedProduct.brand && <div><strong>Brand:</strong> {selectedProduct.brand}</div>}
                <div><strong>Stock:</strong> {selectedProduct.stock_quantity}</div>
                <div><strong>Rating:</strong> {selectedProduct.rating}/5</div>
              </div>
              {selectedProduct.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 whitespace-pre-wrap">{selectedProduct.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}