import { Product } from '../models/product.model';

export function productImagePath(product: Product): string {
  const name = product.name.toLocaleLowerCase();

  // Alimentos para perros
  if (name.includes('perro pequeño')) {
    return '/products/croquetas-perro-pequeno.jpg';
  }

  if (name.includes('perro mediano')) {
    return '/products/croquetas-perro-mediano.jpg';
  }

  if (name.includes('perro grande')) {
    return '/products/croquetas-perro-grande.jpg';
  }

  if (name.includes('croquetas para cachorro')) {
    return '/products/croquetas-cachorro.png';
  }

  if (name.includes('croquetas para perro adulto')) {
    return '/products/croquetas-perro.jpg';
  }

  if (name.includes('comida húmeda para perro')) {
    return '/products/comida-perro-humeda.jpg';
  }

  // Alimentos para gatos
  if (name.includes('gatitos')) {
    return '/products/alimento-gatitos.jpg';
  }

  if (name.includes('gatos adultos')) {
    return '/products/alimento-gatos-adultos.jpg';
  }

  if (name.includes('alimento premium para gatos')) {
    return '/products/alimento-gatos.png';
  }

  if (name.includes('comida húmeda para gato')) {
    return '/products/comida-gato.jpg';
  }

  // Snacks
  if (name.includes('galletas')) {
    return '/products/galletas.png';
  }

  if (name.includes('snack dental')) {
    return '/products/snack-dental.jpg';
  }

  // Juguetes para perros
  if (name.includes('pelota resistente')) {
    return '/products/pelota-perros.jpg';
  }

  if (name.includes('mordedor de goma')) {
    return '/products/mordedor-goma-perros.jpg';
  }

  if (name.includes('peluche para perros')) {
    return '/products/peluche-perros.jpg';
  }

  if (name.includes('dispensador de premios')) {
    return '/products/dispensador-premios.jpg';
  }

  if (name.includes('juguete de cuerda')) {
    return '/products/juguete.jpg';
  }

  // Juguetes para gatos
  if (name.includes('ratón de juguete')) {
    return '/products/raton-gatos.jpg';
  }

  if (name.includes('caña con plumas')) {
    return '/products/cana-plumas-gatos.jpg';
  }

  if (name.includes('pelotas con cascabel')) {
    return '/products/pelotas-cascabel-gatos.jpg';
  }

  if (name.includes('túnel recreativo')) {
    return '/products/tunel-gatos.jpg';
  }

  if (name.includes('rascador')) {
    return '/products/rascador-gatos.jpg';
  }

  // Accesorios
  if (name.includes('fuente de agua')) {
    return '/products/fuente-agua-mascotas.jpg';
  }

  if (name.includes('cama acolchada')) {
    return '/products/cama.jpg';
  }

  if (name.includes('collar')) {
    return '/products/collar.jpg';
  }

  if (name.includes('plato doble')) {
    return '/products/plato.jpg';
  }

  if (name.includes('pechera')) {
    return '/products/pechera.jpg';
  }

  // Higiene
  if (name.includes('arena sanitaria')) {
    return '/products/arena-gatos.jpg';
  }

  if (name.includes('shampoo')) {
    return '/products/shampoo.jpg';
  }

  if (name.includes('tapete')) {
    return '/products/tapete.jpg';
  }

  if (name.includes('cepillo')) {
    return '/products/cepillo.jpg';
  }

  return '/products/croquetas-perro.jpg';
}
