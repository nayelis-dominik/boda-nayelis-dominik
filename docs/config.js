// Edita este archivo para completar los detalles de la invitación.
window.WEDDING = {
  ceremonyAt: '2027-07-09T17:30:00+02:00', // Hora de verano de Oviedo.
  ceremonyTime: '17:30',
  arrivalTime: '17:00', // Hora de llegada: se muestra en grande; la de inicio va debajo.
  ceremonyProvisional: false,
  receptionTime: '18:30',
  photo: '', // Ejemplo: 'assets/pareja.jpg'. Sin foto se muestra el monograma.
  music: '', // Ejemplo: 'assets/cancion.mp3'. Añade un audio que puedas utilizar.
  iban: '',
  // Troceados para que los bots que buscan teléfonos en el código no los reconozcan.
  bridePhone: ['+34', '695', '80', '09', '03'].join(' '),
  groomPhone: ['+34', '625', '99', '34', '30'].join(' '),
  // URL de la aplicación web de Google (apps-script/INSTRUCCIONES.md). Sin ella, el formulario aparece como «próximamente».
  sheetUrl: '',
  formUrl: '' // Opcional: URL https de un formulario externo en lugar del propio.
};
