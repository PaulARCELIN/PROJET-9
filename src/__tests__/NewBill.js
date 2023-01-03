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
      const html = NewBillUI()
      document.body.innerHTML = html
      ///////
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
    
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toHaveClass('active-icon')
    })

    // Test de la fonction "handleChangeFile"
    // Avec un document au mauvais format 
    describe("When I submit a non valid format document", () => {
      it("Should have an error in console", () => {
        document.body.innerHTML = NewBillUI()
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const store = mockStore

        const newBillObject = new NewBill ({document, onNavigate, store, localStorage: window.localStorage}) 
        const handleChangeFile = jest.fn(newBillObject.handleChangeFile)

        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener('change', handleChangeFile)

        const fileWrongData = {
          name: "fichier-test.txt",
          type: "text/txt"
        }

        const fileTest = new File ([""], fileWrongData.name, { type: fileWrongData.type })
        fireEvent.change(fileInput, {target: {files: [fileTest]} })

        expect(handleChangeFile).toHaveBeenCalled()
        expect(console.error).toHaveBeenCalled()
      })
    })

    // On test si on envoi un document avec le bon format 
    describe("When I submit a valid format document", () => {
      //Il ne doit pas y avoir d'erreur 
      it("Should not have an error", () => {
        document.body.innerHTML = NewBillUI()
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))


        const store = mockStore

        const newBillObject = new NewBill ({document, onNavigate, store, localStorage: window.localStorage}) 
        
        const handleChangeFile = jest.fn(newBillObject.handleChangeFile)

        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener('change', handleChangeFile)

        const fileValidData = {
          name: "fichier-test.jpg",
          type: "image/jpeg"
        }

        
        const fileTest = new File ([""], fileValidData.name, { type: fileValidData.type })
        fireEvent.change(fileInput, {target: {files: [fileTest]} })


        expect(handleChangeFile).toBeTruthy()
        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files[0].name).toBe(fileValidData.name)
        expect(fileInput.files[0].type).toBe(fileValidData.type)
      })

      //La fonction "createBill" doit être appelée 
      ////////////
      it("should call createBill function", () => {
        document.body.innerHTML = NewBillUI()
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee' }))

        const store = mockStore

        const newBillObject = new NewBill ({document, onNavigate, store, localStorage: window.localStorage}) 

        const handleChangeFile = jest.fn(newBillObject.handleChangeFile)
        
        const fileValidData = {
          name: "fichier-test.jpg",
          type: "image/jpeg"
        }

        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener('change', handleChangeFile)

        
        const fileTest = new File ([""], fileValidData.name, { type: fileValidData.type })
        fireEvent.change(fileInput, {target: {files: [fileTest]} })
        
        expect(handleChangeFile).toHaveBeenCalled()
      })
    })



    // Test de la fonction handleSubmit
    describe("When I submit the form with all fields valid", () => {
      it ("Should send me on BillsUI page", () => {
        document.body.innerHTML = NewBillUI()
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const store = mockStore

        const newBillObject = new NewBill ({document, onNavigate, store, localStorage: window.localStorage}) 
        const handleSubmit = jest.fn(newBillObject.handleSubmit)

        const submitButton = screen.getAllByTestId('btn-send-bill')
        submitButton[0].addEventListener('submit', handleSubmit)
        
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

        const form = screen.getByTestId('form-new-bill')
        
        fireEvent.submit(form)

        const icon = screen.getByTestId('icon-window')

        expect(handleSubmit).toHaveBeenCalled
        expect(icon).toHaveClass('active-icon')
      }) 
    })

    // Test de l'erreur 500
    //Je valide le formulaire avec tous les champs corrects mais il y a une erreur 500  
    describe("When I submit the form with all fields valid and an error 500 occurs", () => {
      it("Should have en error 500", async () => {
        
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: 'a@a'}))

        document.body.innerHTML = NewBillUI()
        
        const store = mockStore

        const newBillObject = new NewBill ({document, onNavigate, store, localStorage: window.localStorage}) 
        const handleSubmit = jest.fn(newBillObject.handleSubmit)

        const submitButton = screen.getAllByTestId('btn-send-bill')
        submitButton[0].addEventListener('submit', handleSubmit)
        
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

        jest.spyOn(mockStore, "bills")

        const update = jest.spyOn(mockStore.bills(), "update")
        update.mockClear()
        update.mockImplementation(() => {
              return Promise.reject(new Error("Erreur 500"))
           })


        const form = screen.getByTestId("form-new-bill");   
        fireEvent.submit(form)

        await waitFor(() => expect(update()).rejects.toEqual(new Error("Erreur 500")))
        await waitFor(() => expect(console.error).toHaveBeenCalled())

      })
    })
  })
})

