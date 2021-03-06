@trello
$timeout 10
Feature: Exercise various trello API features
  As a developer
  I want to know how our flow through the dev trello board is
  So that I can improve the process

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
      | card   | desc           |
      | task 1 | This is task 1 |
      | task 2 | This is task 2 |
    And I add the "steps" checklist to each card
      | name           |
      | Do this first  |
      | Do this second |
    When I retrieve the cards
    Then I should see the cards that were created
    And each card should have a "steps" checklist with
      | name           |
      | Do this first  |
      | Do this second |
      
