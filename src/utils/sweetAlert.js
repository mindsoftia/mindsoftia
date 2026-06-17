import Swal from 'sweetalert2';

/**
 * Instancia global de SweetAlert2 pre-configurada para Mindsoftia.
 * Incluye los colores y bordes redondeados acordes al diseño de Falcon.
 */
export const showToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const showAlert = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-danger ms-2',
    denyButton: 'btn btn-warning ms-2'
  },
  buttonsStyling: false // Deshabilita los estilos por defecto para usar las clases de Bootstrap/Falcon
});

/**
 * Función rápida para mostrar un mensaje de éxito.
 * @param {string} title 
 * @param {string} text 
 */
export const successAlert = (title, text = '') => {
  return showAlert.fire({
    icon: 'success',
    title: title,
    text: text,
  });
};

/**
 * Función rápida para mostrar un mensaje de error.
 * @param {string} title 
 * @param {string} text 
 */
export const errorAlert = (title, text = '') => {
  return showAlert.fire({
    icon: 'error',
    title: title,
    text: text,
  });
};

/**
 * Función para confirmar una acción destructiva.
 * @param {string} title 
 * @param {string} text 
 */
export const confirmAlert = (title, text = 'No podrás revertir esta acción') => {
  return showAlert.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar'
  });
};

export default Swal;
