import { mount } from '@cypress/vue'
import HomeView from '../../views/HomeView.vue'

describe('HomeView', () => {
  it('playground', () => {
    mount(HomeView)
  })

  it('renders properly', () => {
    mount(HomeView)
    cy.get('h1').should('contain', 'Hello Cypress')
  })
})
