describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display login form elements', () => {
    cy.get('h1').should('contain.text', 'Welcome back')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain.text', 'Sign in')
    cy.get('a[href="/register"]').should('contain.text', 'Sign up')
    cy.get('a[href="/forgot-password"]').should('contain.text', 'Forgot password?')
  })

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click()
    cy.get('p.text-sm.text-red-500').contains('Please enter a valid email address').should('be.visible')
    cy.get('p.text-sm.text-red-500').contains('Password must be at least 6 characters').should('be.visible')
  })

  it('should show validation error for invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('input[type="password"]').type('password123')
    // Trigger validation by blurring the email field
    cy.get('input[type="email"]').blur()
    cy.get('button[type="submit"]').click()
    cy.get('p.text-sm.text-red-500').contains('Please enter a valid email address').should('be.visible')
  })

  it('should show validation error for short password', () => {
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('123')
    cy.get('button[type="submit"]').click()
    cy.get('p.text-sm.text-red-500').contains('Password must be at least 6 characters').should('be.visible')
  })

  it('should attempt login with valid credentials', () => {
    const testEmail = 'test@example.com'
    const testPassword = 'TestPassword123!'

    cy.get('input[type="email"]').type(testEmail)
    cy.get('input[type="password"]').type(testPassword)
    cy.get('button[type="submit"]').click()

    // Check that the button shows loading state (briefly)
    cy.get('button[type="submit"]').should('be.disabled')
  })

  it('should navigate to register page when clicking sign up link', () => {
    cy.get('a[href="/register"]').click()
    cy.url().should('include', '/register')
    cy.get('h1').should('contain.text', 'Create an account')
  })

  it('should navigate to forgot password page when clicking forgot password link', () => {
    cy.get('a[href="/forgot-password"]').click()
    cy.url().should('include', '/forgot-password')
  })
})