
import { describe, it, expect } from 'vitest';
import { productImagePath } from './product-image.util';
import { Product } from '../models/product.model';

describe('productImagePath', () => {
  const createProduct = (name: string): Product =>
    ({ name }) as Product;

  it.each([
    ['perro pequeño', '/products/croquetas-perro-pequeno.jpg'],
    ['perro mediano', '/products/croquetas-perro-mediano.jpg'],
    ['perro grande', '/products/croquetas-perro-grande.jpg'],
    ['croquetas para cachorro', '/products/croquetas-cachorro.png'],
    ['croquetas para perro adulto', '/products/croquetas-perro.jpg'],
    ['comida húmeda para perro', '/products/comida-perro-humeda.jpg'],
    ['gatitos', '/products/alimento-gatitos.jpg'],
    ['gatos adultos', '/products/alimento-gatos-adultos.jpg'],
    ['alimento premium para gatos', '/products/alimento-gatos.png'],
    ['comida húmeda para gato', '/products/comida-gato.jpg'],
    ['galletas', '/products/galletas.png'],
    ['snack dental', '/products/snack-dental.jpg'],
    ['pelota resistente', '/products/pelota-perros.jpg'],
    ['mordedor de goma', '/products/mordedor-goma-perros.jpg'],
    ['peluche para perros', '/products/peluche-perros.jpg'],
    ['dispensador de premios', '/products/dispensador-premios.jpg'],
    ['juguete de cuerda', '/products/juguete.jpg'],
    ['ratón de juguete', '/products/raton-gatos.jpg'],
    ['caña con plumas', '/products/cana-plumas-gatos.jpg'],
    ['pelotas con cascabel', '/products/pelotas-cascabel-gatos.jpg'],
    ['túnel recreativo', '/products/tunel-gatos.jpg'],
    ['rascador', '/products/rascador-gatos.jpg'],
    ['fuente de agua', '/products/fuente-agua-mascotas.jpg'],
    ['cama acolchada', '/products/cama.jpg'],
    ['collar', '/products/collar.jpg'],
    ['plato doble', '/products/plato.jpg'],
    ['pechera', '/products/pechera.jpg'],
    ['arena sanitaria', '/products/arena-gatos.jpg'],
    ['shampoo', '/products/shampoo.jpg'],
    ['tapete', '/products/tapete.jpg'],
    ['cepillo', '/products/cepillo.jpg']
  ])('identifica "%s"', (name, expected) => {
    expect(productImagePath(createProduct(name))).toBe(expected);
  });

  it('convierte el nombre a minúsculas antes de buscar', () => {
    expect(productImagePath(createProduct('PERRO PEQUEÑO')))
      .toBe('/products/croquetas-perro-pequeno.jpg');
  });

  it('utiliza la imagen predeterminada si no reconoce el producto', () => {
    expect(productImagePath(createProduct('Producto desconocido')))
      .toBe('/products/croquetas-perro.jpg');
  });

  it('prioriza la primera coincidencia cuando hay varias', () => {
    expect(productImagePath(createProduct('perro pequeño y perro grande')))
      .toBe('/products/croquetas-perro-pequeno.jpg');
  });
});
