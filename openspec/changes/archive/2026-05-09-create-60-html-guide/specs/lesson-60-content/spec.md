## ADDED Requirements

### Requirement: Interactive Learning Guide

The system SHALL provide an interactive HTML page (60.html) for Friends Episode 60 to facilitate English learning.

#### Scenario: User navigates to the guide

- **WHEN** user opens 60.html
- **THEN** the guide displays scene introductions, vocabulary, grammar, and pronunciation practices.

### Requirement: Automatic Bilingual Subtitles

The system SHALL integrate bilingual subtitle content (English on top, Traditional Chinese on bottom) mapped to specific timestamps.

#### Scenario: Subtitles displayed within the interface

- **WHEN** user views a specific dialogue scene
- **THEN** the dialogue text displays bilingual subtitles based on 60.srt.

### Requirement: AB Loop Playback

The system SHALL support looping specific video segments defined by HTML properties.

#### Scenario: Looping a dialogue segment

- **WHEN** user clicks a play button associated with a `data-start` and `data-end` timestamp
- **THEN** the video plays from `data-start` to `data-end` and automatically restarts at `data-start`.
