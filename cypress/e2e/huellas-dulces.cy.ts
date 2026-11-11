
describe('Huellas Dulces - Pruebas E2E', () => {
  const producto = {
    id: 1,
    name: 'Croquetas para perro adulto',
    description: 'Alimento completo para perros adultos.',
    category: 'Alimento para perros',
    price: 25000,
    stock: 15,
    available: true
  };

  beforeEach(() => {
    cy.intercept('GET', '**/api/v1/products', {
      statusCode: 200,
      body: [producto]
    }).as('getProducts');
  });

  it('permite iniciar sesión correctamente', () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'token-prueba-cypress',
        tokenType: 'Bearer'
      }
    }).as('login');

    cy.visit('/login');

    cy.get('input[formcontrolname="username"]')
      .type('admin');

    cy.get('input[formcontrolname="password"]')
      .type('Admin123*');

    cy.contains('button', 'Ingresar').click();

    cy.wait('@login');

    cy.window().should((window) => {
      expect(window.localStorage.getItem('huellas-token'))
        .to.equal('token-prueba-cypress');
    });

    cy.location('pathname').should('eq', '/');
  });

  it('permite explorar y buscar productos', () => {
    cy.intercept('GET', '**/api/v1/products/search*', {
      statusCode: 200,
      body: [producto]
    }).as('searchProducts');

    cy.visit('/');

    cy.contains('button', 'Ver todos los productos').click();

    cy.get('input[aria-label="Buscar productos"]')
      .should('be.visible')
      .type('Croquetas');

    cy.wait('@searchProducts');

    cy.contains('Croquetas para perro adulto')
      .should('be.visible');
  });

  it('maneja correctamente un error 500 al buscar productos', () => {
    cy.intercept('GET', '**/api/v1/products/search*', {
      statusCode: 500,
      body: {
        message: 'Error interno del servidor'
      }
    }).as('searchError');

    cy.visit('/');

    cy.contains('button', 'Ver todos los productos').click();

    cy.get('input[aria-label="Buscar productos"]')
      .should('be.visible')
      .type('producto-inexistente');

    cy.wait('@searchError');

    cy.contains('No encontramos productos')
      .should('be.visible');
  });
});
