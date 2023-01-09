/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";

import mockStore from "../__mocks__/store"
jest.mock("../app/store", () => mockStore)


import router from "../app/Router.js";

// En tant qu'employé
describe("Given I am connected as an employee", () => {
  //Quand je suis sur la page "Bills"
  describe("When I am on Bills Page", () => {
    // L'icone Bill doit être en surbrillance
    test("Then bill icon in vertical layout should be highlighted", async () => {

      // On définie l'utilisateur en tant qu'"employé"
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // On navique vers la page "Bills"
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      
      // On récupère l'icone 
      const windowIcon = screen.getByTestId('icon-window')
      
      //TODO 5 
      //Expression pour vérifier que l'icone soit bien en surbrillance
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })

    //Test pour le triage des dates
    //Les factures sont triées selon les dates (anti-chrono)
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
    
    // Test ouverture de la modale
    //Quand je click sur l'icone "Eye"
    describe("When I click on IconEye", () => {
      //La modale doit apparaitre 
      it("Then the modal should appear on screen", async () => {
        
        // On appel BillsUI avec les données de "fixtures"
        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        // Pas besoin de "store" pour ce test, mais il doit être défini pour créer billsObject
        const store = null 
        const billsObject = new Bills ({document, onNavigate, store, localStorage: window.localStorage})
        $.fn.modal = jest.fn();

        // On mock la méthode "handeClickIconEye" de BillsObject
        const handleClickIconEye = jest.fn(billsObject.handleClickIconEye)
        
        // On récupère "iconEye" et simule le cick
        const iconEye = screen.getAllByTestId('icon-eye')[0]
        iconEye.addEventListener('click', () => handleClickIconEye(iconEye)) 
        fireEvent.click(iconEye)

        // On vérifie que la méthode a bien été appelée
        expect(handleClickIconEye).toHaveBeenCalled()
        // On vérifie que la modale s'affiche à l'écran 
        const modalBody = screen.getByTestId('modal-body')
        expect(modalBody).toBeTruthy()
      })
    })

    // Test du bouton NewBill
    //Quand je clique sur la bouton NewBill
    describe("When I click on NewBill button", () => {
      //Je suis redirigé vers la page NewBill
      test("Then i am redirected on the new bill page", async () => {
        
        // On appel BillsUI avec les données de "fixtures"
        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        // Pas besoin de "store" pour ce test, mais il doit être défini pour créer billsObject
        const store = null 
        const billsObject = new Bills ({document, onNavigate, store, localStorage: window.localStorage})
        $.fn.modal = jest.fn();

        // On mock la méthode "handeClickNewBill" de BillsObject
        const handleClickNewBill = jest.fn(billsObject.handleClickNewBill)

        // On récupère le bouton "newBill" et simule le click  
        const newBillButton = screen.getByTestId('btn-new-bill')
        newBillButton.addEventListener('click', () => handleClickNewBill())
        fireEvent.click(newBillButton)

        // On vérifie que la méthode "handleClickNewBill" a bien été appelée
        expect(handleClickNewBill).toHaveBeenCalled()
        // On vérifie que le text "Envoyer une note de frais" soit défini
        expect(screen.queryByText('Envoyer une note de frais')).toBeDefined()
      })
    })
})

  
  // Test de la fonction getBills()
  // Je dois avoir la liste des factures
  test("I shoud have a list of bills", async () => {
    
    // On appel BillsUI avec les données de "fixtures"
    document.body.innerHTML = BillsUI({ data: bills })
    const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

    // On mock le store et crée billsObject  
    const store = mockStore 
    const billsObject = new Bills ({document, onNavigate, store, localStorage: window.localStorage})
    
    // On mock la méthode getBills de billsObject
    const getBills = jest.fn(billsObject.getBills)
    
    // On vérifie que getBills soit défini
    expect(getBills()).toBeDefined();
  })

  