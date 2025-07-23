describe('Signup Flow', () => {
  beforeEach(() => {
    // Visit the signup page before each test
    cy.visit('/register')
    cy.waitForPageLoad()
  })

  it('should display the signup form correctly', () => {
    // Check if all form elements are present
    cy.get('h1').should('contain.text', 'Create an account')
    cy.get('p').should('contain.text', 'Enter your information to get started')
    
    // Check form fields
    cy.get('#firstName').should('be.visible')
    cy.get('#lastName').should('be.visible')
    cy.get('#email').should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('#confirmPassword').should('be.visible')
    
    // Check submit button
    cy.get('button[type="submit"]').should('be.visible').and('contain.text', 'Create account')
  })

  it('should show validation errors for invalid input', () => {
    // Test invalid email
    cy.get('#email').type('invalid-email')
    cy.get('#email').blur()
    cy.contains('.text-red-500', 'Please enter a valid email address').should('be.visible')
    
    // Test password mismatch
    cy.get('#password').type('TestPassword123!')
    cy.get('#confirmPassword').type('DifferentPassword123!')
    cy.get('#confirmPassword').blur()
    cy.contains('.text-red-500', 'Passwords don\'t match').should('be.visible')
  })

  it('should successfully submit valid signup form with mock', () => {
    // This test validates form submission with mocked API response
    const testEmail = 'test@example.com'
    const testPassword = 'TestPassword123!'
    const firstName = 'John'
    const lastName = 'Doe'
    
    // Mock the signup API to avoid creating actual users
    cy.intercept('POST', '/api/signup', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: 'mock-user-id',
          email: testEmail
        },
        profile: {
          id: 'mock-user-id',
          firstName: firstName,
          lastName: lastName
        }
      }
    }).as('mockSignup')
    
    // Fill out the form with valid data
    cy.fillSignupForm(firstName, lastName, testEmail, testPassword, testPassword)
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Verify the API was called with correct data
    cy.wait('@mockSignup').then((interception) => {
      expect(interception.request.body).to.deep.include({
        email: testEmail,
        password: testPassword,
        firstName: firstName,
        lastName: lastName
      })
    })
    
    // Note: We don't test Stack Auth sign-in in this mocked test since it's complex to mock
    // The important part is that the signup API is called with the correct data
  })

  it('should create user and profile during unified signup process', () => {
    // This test verifies the complete signup flow including user and profile creation
    // It creates an actual user in the database to test the real integration
    
    const timestamp = Date.now()
    const testEmail = `signup${timestamp}@example.com`
    const testPassword = 'TestPassword123!'
    const firstName = 'Jane'
    const lastName = 'Smith'
    
    // Monitor network requests to signup API
    cy.intercept('POST', '/api/signup').as('signupRequest')
    
    // Fill and submit the form
    cy.fillSignupForm(firstName, lastName, testEmail, testPassword, testPassword)
    cy.get('button[type="submit"]').click()
    
    // Wait for the signup request to be made
    cy.wait('@signupRequest', { timeout: 10000 }).then((interception) => {
      // Verify the signup request contains the correct data
      expect(interception.request.body).to.deep.include({
        email: testEmail,
        password: testPassword,
        firstName: firstName,
        lastName: lastName
      })
      
      // Verify the response indicates success
      expect(interception.response?.statusCode).to.equal(200)
      expect(interception.response?.body).to.have.property('success', true)
      expect(interception.response?.body).to.have.property('user')
      expect(interception.response?.body).to.have.property('profile')
      
      // Verify user data in response
      const user = interception.response?.body.user
      expect(user).to.have.property('email', testEmail)
      expect(user).to.have.property('id')
      
      // Verify profile data in response
      const profile = interception.response?.body.profile
      expect(profile).to.have.property('firstName', firstName)
      expect(profile).to.have.property('lastName', lastName)
      expect(profile).to.have.property('id', user.id) // Profile ID should match user ID
    })
    
    // Note: We don't test the actual redirection in this test since Stack Auth sign-in
    // might not work in the Cypress environment. The important part is that the
    // server-side signup API works correctly and creates both user and profile.
  })

  it('should navigate to login page when clicking sign in link', () => {
    cy.get('a[href="/login"]').click()
    cy.url().should('include', '/login')
    cy.get('h1').should('contain.text', 'Welcome back')
  })
})