/*ESSE SCRIPT ABAIXO É NECESSÁRIO PARA A VALIDAÇÃO CLIENT SIDE DO FORMULÁRIO
BOOTSTRAP, O FORMULÁRIO TEM QUE TER A CLASSE validated-form e a opção required no 
input*/

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    // a classe validated-form tem que ser a mesma classe do formulário
    const forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
        })
    })()