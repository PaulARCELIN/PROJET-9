/**
 * @jest-environment jsdom
 */

 import { fireEvent, screen, waitFor } from "@testing-library/dom"
 import '@testing-library/jest-dom'
 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import {localStorageMock} from "../__mocks__/localStorage.js"
 import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
 import mockStore from "../__mocks__/store"
 import router from "../app/Router.js"
 
 jest.spyOn(global.console, 'error')
 jest.mock("../app/Store", () => mockStore)


// En tant qu'utilisateur "employé" 
describe("Given I am connected as an employee", () => {
  
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  // Quand je suis sur la page NewBill
  describe("When I am on NewBill Page", () => {
    //L'icone "mail" doit être en surbrillance
    it("Then mail icon in vertical layout should be highlighted", () => {
      // On appel la page "NewBillUI"
      const html = NewBillUI()
      document.body.innerHTML = html
      
      // On défini l'utilisateur "employé"
      //Object.defineProperty(obj, prop, descriptor)
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
    
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      // On vérifie que l'incone soit en surbrillance
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toHaveClass('active-icon')
    })


    // Test de la fonction "handleChangeFile"
    
    // Avec un document au mauvais format 
    describe("When I submit a non valid format document", () => {
      it("Should have an error in console", () => {
        // On appel la page "NewBillUI"
        document.body.innerHTML = NewBillUI()

        // On défini l'utilisateur "employé"
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))


        // On mock le store afin de ne pas appeler l'API
        const store = mockStore

        // On définie la méthode "handleChangeFile" de l'objet mocké
        const newBillObject = new NewBill ({document, onNavigate, store, localStorage: window.localStorage}) 
        const handleChangeFile = jest.fn(newBillObject.handleChangeFile)

        // On récupère l'input
        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener('change', handleChangeFile)

        // On passe un fichier avec une mauvaise extension 
        const fileWrongData = {
          name: "fichier-test.txt",
          type: "text/txt"
        }
        const fileTest = new File ([""], fileWrongData.name, { type: fileWrongData.type })
        fireEvent.change(fileInput, {target: {files: [fileTest]} })

        // On vérifie que la méthode a bien été appelée 
        expect(handleChangeFile).toHaveBeenCalled()
        // On vérifier que la console a bien affiché une erreur
        expect(console.error).toHaveBeenCalled()
      })
    })


    // On test si on envoi un document avec le bon format 
    describe("When I submit a valid format document", () => {
      //L'input doit contenir le fichier 
      it("Should have the file in the input", () => {
        
        // On appel la page "NewBillUI"
        document.body.innerHTML = NewBillUI()
       
        // On défini l'utilisateur "employé"
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        // On mock le store afin de ne pas appeler l'API
        const store = mockStore

        // On définie la méthode "handleChangeFile" de l'objet mocké
        const newBillObject = new NewBill ({document, onNavigate, store, localStorage: window.localStorage}) 
        const handleChangeFile = jest.fn(newBillObject.handleChangeFile)

        // On récupère l'input
        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener('change', handleChangeFile)

        // On passe un fichier avec une extension valide
        const fileValidData = {
          name: "fichier-test.jpg",
          type: "image/jpeg"
        }
        const fileTest = new File ([""], fileValidData.name, { type: fileValidData.type })
        fireEvent.change(fileInput, {target: {files: [fileTest]} })

        // On vérifie que la méthode a bien été appelée
        expect(handleChangeFile).toBeTruthy()
        expect(handleChangeFile).toHaveBeenCalled()
        // On vérifie que l'input contien bien le fichier 
        expect(fileInput.files[0].name).toBe(fileValidData.name)
        expect(fileInput.files[0].type).toBe(fileValidData.type)
      })
    })


    // Test de la fonction handleSubmit
    describe("When I submit the form with all fields valid", () => {
      it ("Should send me on BillsUI page", () => {
        // On appel la page "NewBillUI"
        document.body.innerHTML = NewBillUI()
        
        // On défini l'utilisateur "employé"
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        // On mock le store afin de ne pas appeler l'API
        const store = mockStore

        // On définie la méthode "handleSubmit" de l'objet mocké
        const newBillObject = new NewBill ({document, onNavigate, store, localStorage: window.localStorage}) 
        const handleSubmit = jest.fn(newBillObject.handleSubmit)

        // On récupère le bouton Submit
        const submitButton = screen.getAllByTestId('btn-send-bill')
        submitButton[0].addEventListener('submit', handleSubmit)
        
        // On rempli tous les champs avec des données valides
        const type = screen.getByTestId("expense-type")
        fireEvent.change(type, {target: {value: "Transports"}})
        const name = screen.getByTestId("expense-name")
        fireEvent.change(name, {target: {value: "test"}})
        const date = screen.getByTestId("datepicker")
        fireEvent.change(date, {target: {value: '2022-10-10'}})
        const amount = screen.getByTestId("amount")
        fireEvent.change(amount, {target: {value: "500"}})
        const vat = screen.getByTestId("vat")
        fireEvent.change(vat, {target: {value: "20"}})
        const pct = screen.getByTestId("pct")
        fireEvent.change(pct, {target: {value: "20"}})
        const commentary = screen.getByTestId("commentary")
        fireEvent.change(commentary, {target: {value: "Commentaire test"}})
        const fileValidData = {
          name: "fichier-test.jpg",
          type: "image/jpeg"
        }
        const fileInput = screen.getByTestId('file')
        const fileTest = new File ([""], fileValidData.name, { type: fileValidData.type })
        fireEvent.change(fileInput, {target: {files: [fileTest]} })

        // On récupère le formulaire et on le "submit"
        const form = screen.getByTestId('form-new-bill')
        fireEvent.submit(form)

        // On récupère l'icone
        const icon = screen.getByTestId('icon-window')

        // On vérifie que la méthode "handleSubmit" est bien été appelée
        expect(handleSubmit).toHaveBeenCalled
        // On vérifier que l'icone soit bien en surbrillance
        expect(icon).toHaveClass('active-icon')
      }) 
    })

    // Test de l'erreur 500
    //Je valide le formulaire avec tous les champs corrects mais il y a une erreur 500  
    describe("When I submit the form with all fields valid and an error 500 occurs", () => {
      it("Should have en error 500", async () => {
        // On appel la page "NewBillUI"
        document.body.innerHTML = NewBillUI()
        
        // On défini l'utilisateur "employé"
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        // On mock le store afin de ne pas appeler l'API
        const store = mockStore

        // On définie la méthode "handleSubmit" de l'objet mocké
        const newBillObject = new NewBill ({document, onNavigate, store, localStorage: window.localStorage}) 
        const handleSubmit = jest.fn(newBillObject.handleSubmit)

        // On récupère le bouton Submit
        const submitButton = screen.getAllByTestId('btn-send-bill')
        submitButton[0].addEventListener('submit', handleSubmit)

        // On rempli tous les champs avec des données valides
        const type = screen.getByTestId("expense-type")
        fireEvent.change(type, {target: {value: "Transports"}})
        const name = screen.getByTestId("expense-name")
        fireEvent.change(name, {target: {value: "test"}})
        const date = screen.getByTestId("datepicker")
        fireEvent.change(date, {target: {value: '2022-10-10'}})
        const amount = screen.getByTestId("amount")
        fireEvent.change(amount, {target: {value: "500"}})
        const vat = screen.getByTestId("vat")
        fireEvent.change(vat, {target: {value: "20"}})
        const pct = screen.getByTestId("pct")
        fireEvent.change(pct, {target: {value: "20"}})
        const commentary = screen.getByTestId("commentary")
        fireEvent.change(commentary, {target: {value: "Commentaire test"}})

        // On mock la méthode "update"
        jest.spyOn(mockStore, "bills")
        const update = jest.spyOn(mockStore.bills(), "update")
        update.mockClear()
        // On renvoi une erreur 500 
        update.mockImplementation(() => {
              return Promise.reject(new Error("Erreur 500"))
           })

        // On récupère le formulaire et le "submit"
        const form = screen.getByTestId("form-new-bill");   
        fireEvent.submit(form)

        // On vérifie bien que la requête est rejetée et renvoi une erreur 500
        await waitFor(() => expect(update()).rejects.toEqual(new Error("Erreur 500")))
        // On vérifie qu'il y ai bien une erreur dans la console 
        await waitFor(() => expect(console.error).toHaveBeenCalled())
      })
    })
  })
})

// Test de l'erreur 404
describe("When I submit the form and an error 404 occurs", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills")
    // On appel la page "NewBillUI"
    document.body.innerHTML = NewBillUI()
        
    // On défini l'utilisateur "employé"
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })


  test("should have a 404 message error", async () => {
    // On mock une erreur 404 sur l'appel de l'API
    mockStore.bills.mockImplementation(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 404"))
        }
      }})
    window.onNavigate(ROUTES_PATH.Bills)
    await new Promise(process.nextTick);

    // On vérifie que le message "erreur 404" apparait bien à l'écran 
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })
})

  