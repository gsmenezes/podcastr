export function convertDurationToTimeString(duration: number) {
  const hours = Math.floor(duration / 3600) //Math.floor para arrendondar para baixo
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  const timeString = [hours, minutes, seconds].map(unit => String(unit).padStart(2, '0')) //para ter 2 digitos sempre
  .join(':')

  return timeString;
}
