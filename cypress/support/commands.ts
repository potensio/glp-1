/// <reference types="cypress" />
import 'cypress-real-events'

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to select elements by data-cy attribute
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`)
})

// Custom command to fill signup form
Cypress.Commands.add('fillSignupForm', (firstName: string, lastName: string, email: string, password: string, confirmPassword: string) => {
  cy.get('#firstName').clear().type(firstName)
  cy.get('#lastName').clear().type(lastName)
  cy.get('#email').clear().type(email)
  cy.get('#password').clear().type(password)
  cy.get('#confirmPassword').clear().type(confirmPassword)
})

// Custom command to fill login form
Cypress.Commands.add('fillLoginForm', (email: string, password: string) => {
  cy.get('#email').clear().type(email)
  cy.get('#password').clear().type(password)
})

// Custom command to generate unique test email
Cypress.Commands.add('generateTestEmail', () => {
  const timestamp = Date.now()
  return cy.wrap(`test${timestamp}@example.com`)
})

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.url().should('not.contain', 'loading')
})

// Custom command for tab navigation
Cypress.Commands.add('tab', { prevSubject: 'element' }, (subject) => {
  return cy.wrap(subject).trigger('keydown', { key: 'Tab' })
})

// Extend Cypress namespace for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      dataCy(value: string): Chainable<JQuery<HTMLElement>>
      fillSignupForm(firstName: string, lastName: string, email: string, password: string, confirmPassword: string): Chainable<void>
      fillLoginForm(email: string, password: string): Chainable<void>
      generateTestEmail(): Chainable<string>
      waitForPageLoad(): Chainable<void>
      tab(): Chainable<JQuery<HTMLElement>>
    }
  }
}