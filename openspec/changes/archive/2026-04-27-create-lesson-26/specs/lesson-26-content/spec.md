## ADDED Requirements

### Requirement: Lesson 26 Grammar and Pronunciation Analysis
The system SHALL analyze "Linking" and "Weak Forms" in the selected lines, including interactive play buttons with accurate timestamp looping.

#### Scenario: Interactive Pronunciation Study
- **WHEN** user clicks the play button next to "does it hurt?"
- **THEN** system plays the audio segment from exactly 01:30 to 01:31 and loops between these points until stopped.

### Requirement: Accurate A-B Looping Logic
The system MUST implement a robust A-B loop mechanism that monitors the video's current time and seeks back to the start point when the end point is reached.

#### Scenario: Successful A-B Loop Execution
- **WHEN** a user initiates a loop for the segment "As much as he needs" (01:42-01:44)
- **THEN** the video player jumps to 01:42, plays until 01:44, and immediately returns to 01:42 to repeat the cycle.
