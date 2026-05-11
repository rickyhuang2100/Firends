# lesson-60-content Specification

## Purpose

TBD - created by archiving change 'create-60-html-guide'. Update Purpose after archive.

## Requirements

### Requirement: Interactive Learning Guide

The system SHALL provide an interactive HTML page (60.html) for Friends Episode 60 to facilitate English learning.

#### Scenario: User navigates to the guide

- **WHEN** user opens 60.html
- **THEN** the guide displays scene introductions, vocabulary, grammar, and pronunciation practices.


<!-- @trace
source: create-60-html-guide
updated: 2026-05-09
code:
  - proposal_temp.md
  - public/66.srt
  - public/55.html
  - spec_tmp.md
  - public/59.html
  - apply_utf8.json
  - tasks_tmp.md
  - public/53.html
  - public/63.srt
  - apply.json
  - public/56.html
  - public/62.srt
  - public/65.srt
  - spec_instructions.json
  - public/61.srt
  - public/58.html
  - public/60.html
  - tasks_instructions.txt
  - public/64.srt
  - public/57.html
  - public/54.html
  - public/60.srt
  - design_tmp.md
-->

---
### Requirement: Automatic Bilingual Subtitles

The system SHALL integrate bilingual subtitle content (English on top, Traditional Chinese on bottom) mapped to specific timestamps.

#### Scenario: Subtitles displayed within the interface

- **WHEN** user views a specific dialogue scene
- **THEN** the dialogue text displays bilingual subtitles based on 60.srt.


<!-- @trace
source: create-60-html-guide
updated: 2026-05-09
code:
  - proposal_temp.md
  - public/66.srt
  - public/55.html
  - spec_tmp.md
  - public/59.html
  - apply_utf8.json
  - tasks_tmp.md
  - public/53.html
  - public/63.srt
  - apply.json
  - public/56.html
  - public/62.srt
  - public/65.srt
  - spec_instructions.json
  - public/61.srt
  - public/58.html
  - public/60.html
  - tasks_instructions.txt
  - public/64.srt
  - public/57.html
  - public/54.html
  - public/60.srt
  - design_tmp.md
-->

---
### Requirement: AB Loop Playback

The system SHALL support looping specific video segments defined by HTML properties.

#### Scenario: Looping a dialogue segment

- **WHEN** user clicks a play button associated with a `data-start` and `data-end` timestamp
- **THEN** the video plays from `data-start` to `data-end` and automatically restarts at `data-start`.

<!-- @trace
source: create-60-html-guide
updated: 2026-05-09
code:
  - proposal_temp.md
  - public/66.srt
  - public/55.html
  - spec_tmp.md
  - public/59.html
  - apply_utf8.json
  - tasks_tmp.md
  - public/53.html
  - public/63.srt
  - apply.json
  - public/56.html
  - public/62.srt
  - public/65.srt
  - spec_instructions.json
  - public/61.srt
  - public/58.html
  - public/60.html
  - tasks_instructions.txt
  - public/64.srt
  - public/57.html
  - public/54.html
  - public/60.srt
  - design_tmp.md
-->