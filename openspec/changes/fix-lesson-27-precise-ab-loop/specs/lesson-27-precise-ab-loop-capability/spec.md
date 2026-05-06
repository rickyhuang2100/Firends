## ADDED Requirements

### Requirement: Lesson 27 Teaching Guide Content
Teaching guide SHALL contain seven sections as defined in public/gemini.md.

#### Scenario: Displaying Complete Lesson Structure
- **WHEN** the user opens the Lesson 27 page
- **THEN** all seven mandatory sections MUST be visible.

### Requirement: Precise AB Loop Monitoring
Video player SHALL use requestAnimationFrame for millisecond precision seeking.

#### Scenario: Accurate Re-seeking
- **WHEN** the playback time reaches the end time
- **THEN** the player SHALL seek to the start time within 20ms.
