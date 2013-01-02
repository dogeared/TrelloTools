$timeout 10
Feature: Support Trello API actions through event handling
  As a developer
  I want to know when Trello API actions occur
  So that I can have event handlers tied to those actions

  Background:
    Given I have connected to the Trello API
    And the test board is available
    And I have reset the test board

  Scenario: board actions: create lane
    Given I setup the trello event listener
    And I create a lane called "A"
    When I check the event information
    Then I should see the event for "A"
