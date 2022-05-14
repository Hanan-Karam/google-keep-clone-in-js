class App{
    constructor(){
        //console.log("Hello there")
        //our variables that will be used
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.title = '';
        this.text ='';
        this.id = '';

        this.$notes = document.querySelector('#notes');
        this.$placeholder = document.querySelector('#placeholder')
        this.$form = document.querySelector('#form');
        this.$noteTitle = document.querySelector('#note-title');
        this.$noteText = document.querySelector('#note-text');
        this.$formButtons = document.querySelector('#form-buttons')
        this.$closeButton = document.querySelector('#form-close-button');
        this.$modal = document.querySelector('.modal');
        this.$modalTitle =  document.querySelector('.modal-title');
        this.$modalText =  document.querySelector('.modal-text');
        this.$modalcloseButton=  document.querySelector('.modal-close-button');
        this.$colorTooltip = document.querySelector('#color-tooltip');

        this.render(); //to display initial notes
        this.addEventListeners();
    }


    /*-------------method to add different event listeners to our app---------------- */
    addEventListeners(){
        //adding the click event that opens the form 
        document.body.addEventListener('click', (event) => {
            this.handleFormClick(event);
            this.selectNote(event); //make sure to add selectNote before OpenNote
            this.openModal(event);
            this.deleteNote(event);

     });

     document.body.addEventListener('mouseover', (event) => {
        this.openTooltip(event);
    })

    document.body.addEventListener('mouseout', (event) => {
        this.closeTooltip(event);
    })

    //to be able to click the color
    this.$colorTooltip.addEventListener('mouseover', function() {
        this.style.display = 'flex';  
      })
      
      this.$colorTooltip.addEventListener('mouseout', function() {
        this.style.display = 'none'; 
     })


     this.$colorTooltip.addEventListener('click', event => {
        const color = event.target.dataset.color; 
        if (color) {
          this.editNoteColor(color);  
        }
     })

     //adding the submit event that add a note
        this.$form.addEventListener('submit', (event) => {
            event.preventDefault();
            const title = this.$noteTitle.value;
            const text = this.$noteText.value;
            const hasNote = title || text;
            if(hasNote){
                this.addNote({title, text})
            }

        })
        this.$closeButton.addEventListener('click', (event) =>{
            //to fix the bubbling that caused by running the handleFormClick method, 
            //that calls the open form method
            event.stopPropagation();
            this.closeForm();
        })

        this.$modalcloseButton.addEventListener('click', (event) => {
            this.closeModal(event);
        })
    }



    //method to handle the click event on the form
    handleFormClick(event){
        const isFormClicked = this.$form.contains(event.target);
        const title = this.$noteTitle.value;
        const text = this.$noteText.value;
        const hasNote = title || text;

        if(isFormClicked){
            //open form
            this.openForm();
        }else if(hasNote){
            this.addNote({title, text});
        }else{
            //close form
            this.closeForm()
        }
    }


    //method to open the form if clicked
    openForm(){
        this.$form.classList.add('form-open');
        this.$noteTitle.style.display = 'block';
        this.$formButtons.style.display = 'block';
    }

    //method to close the form if we clicked away
    closeForm(){
        this.$form.classList.remove('form-open');
        this.$noteTitle.style.display = 'none';
        this.$formButtons.style.display = 'none';
        //to cleare the form fields before collapse the form
        this.$noteText.value = "";
        this.$noteTitle.value = "";
    }


        //methode  to open the note modal
        openModal(event){
            if(event.target.matches('.toolbar-delete')) return //to stop opening the model when clicking the delete icon
            if(event.target.closest('.note')){
                this.$modal.classList.toggle('open-modal');
                this.$modalTitle.value = this.title;
                this.$modalText.value = this.text;
            }
        }
    
        //methode to close the modal after editing the note
        closeModal(event){
            this.editNote();
            this.$modal.classList.toggle('open-modal');
        }


    //method to change the note color
    openTooltip(event) {
        if (!event.target.matches('.toolbar-color')) return;
        this.id = event.target.dataset.id; 
        const noteCoords = event.target.getBoundingClientRect();
        const horizontal = noteCoords.left ;
        const vertical = window.scrollY -20;
        this.$colorTooltip.style.transform = `translate(${horizontal}px, ${vertical}px)`;
        this.$colorTooltip.style.display = 'flex';
      }

      //closing the tooltip
      closeTooltip(event) {
        if (!event.target.matches('.toolbar-color')) return;
        this.$colorTooltip.style.display = 'none';  
      }

    
    //method to add notes once submit
    addNote(note){
        const newNote = {
            title: note.title,
            text:note.text,
            color:'white',
            id: this.notes.length > 0 ? this.notes[this.notes.length-1].id +1 : 1
        };
        this.notes = [...this.notes, newNote];
        //console.log(this.notes);
        this.render();
        //to collapse the form after adding a note
        this.closeForm();
    }


    // method to edit the note in the modal before saving it
    editNote(){
        const title =this.$modalTitle.value;
        const text = this.$modalText.value;
        this.notes = this.notes.map(note => note.id === Number(this.id) ? {...note, title, text} : note

        );
        this.render();
    }


    //method to edit the note color
    editNoteColor(color) {
        this.notes = this.notes.map(note =>
          note.id === Number(this.id) ? { ...note, color } : note
        );
        this.render();
      }


    //methode to get the selected note we want to edit
    selectNote(event){
        const selectedNote = event.target.closest('.note');
        if (!selectedNote) return; // so we don't get error when we try to get the children of the selected note
        const [$noteTitle, $noteText] = selectedNote.children;
        this.title = $noteTitle.innerText;
        this.text = $noteText.innerText;
        this.id = selectedNote.dataset.id;

    }


    //method to delete note
    deleteNote(event){
        event.stopPropagation();
        if (!event.target.matches('.toolbar-delete')) return;
        const id = event.target.dataset.id;
        this.notes = this.notes.filter (note => note.id !== Number(id));
        this.render();
    }

   render(){
       this.saveNote();
       this.displayNotes();
   }

    //saving our notes to the local storage
    saveNote(){
        localStorage.setItem('notes', JSON.stringify(this.notes))
    }


    displayNotes(){
        const hasNotes = this.notes.length > 0;
        this.$placeholder.style.display = hasNotes ? 'none' : 'flex';
        this.$notes.innerHTML = this.notes.map(note => `
        <div style = background:${note.color}; class="note" data-id='${note.id}'>
            <div class ="${note.title && 'note-title'}">${note.title}</div>
            <div class ="note-text">${note.text}</div>
            <div class="toolbar-container">
                <div class="toolbar">
                    <img class="toolbar-color" data-id=${note.id} src="palette.png">
                    <img class="toolbar-delete" data-id=${note.id} src="trash.png">
                </div>
            </div>
        </div>
        
        `).join("");// to remove the comma appeared between each note of the array map

    }



}
new App()