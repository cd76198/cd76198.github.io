// Shared numbered heading for nearby notes and both explanation dialogs.
export function setNoteHeading(heading, title, number) {
  heading.replaceChildren();
  heading.classList.add('note-heading');
  if (number != null) {
    const badge = document.createElement('span');
    badge.className = 'note-number';
    badge.textContent = String(number);
    heading.append(badge);
  }
  const label = document.createElement('span');
  label.className = 'note-heading-text';
  label.textContent = title;
  heading.append(label);
}
