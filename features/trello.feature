$timeout 10
Feature: Get stats from Trello
  As a developer
  I want to know how our flow through the dev trello board is
  So that we can improve the process

  Background:
    Given I have connected to the Trello API
    And the test board is available
    And I have reset the test board
    
  Scenario: work with lanes
    Given I create lanes
      | lane  |
      | Ready |
      | Dev   |
      | Done  |
    When I retrieve the lanes
    Then I should I should see the lanes that were created

  Scenario: work with cards
    Given I create lanes
      | lane  |
      | A     |
    And I retrieve the lanes
    And I add cards
      | card   |
      | task 1 |
      | task 2 |
    When I retrieve the cards
    Then I should see the cards that were created
