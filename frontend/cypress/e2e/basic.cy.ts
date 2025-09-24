describe('Basic E2E', () => {
  it('loads home page', () => {
    cy.visit('/')
    cy.contains('Welcome to QuizPRO')
  })
})
