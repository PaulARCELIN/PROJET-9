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

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      
      //TODO 5 
      //Expression pour vérifier
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
        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null 
        const billsObject = new Bills ({document, onNavigate, store, localStorage: window.localStorage})
        
        /////////////
        $.fn.modal = jest.fn();

        const handleClickIconEye = jest.fn(billsObject.handleClickIconEye)
        const iconEye = screen.getAllByTestId('icon-eye')[0]
        iconEye.addEventListener('click', () => handleClickIconEye(iconEye)) 
        fireEvent.click(iconEye)

        expect(handleClickIconEye).toHaveBeenCalled()
        const modalBody = screen.getByTestId('modal-body')
        expect(modalBody).toBeTruthy()
      })
    })

    // Test du bouton NewBill
    //Quand je clique sur la bouton NewBill
    describe("When I click on NewBill button", () => {
      //Je suis redirigé vers la page NewBill
      test("Then i am redirected on the new bill page", async () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null 
        const billsObject = new Bills ({document, onNavigate, store, localStorage: window.localStorage})
        
        $.fn.modal = jest.fn();
        const handleClickNewBill = jest.fn(billsObject.handleClickNewBill)

        const newBillButton = screen.getByTestId('btn-new-bill')
        newBillButton.addEventListener('click', () => handleClickNewBill())
        fireEvent.click(newBillButton)
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.queryByText('Envoyer une note de frais')).not.toBeNull()
      })
    })
})

  
  // Test de la fonction getBills()
  // Je dois avoir la liste des factures
  test("I shoud have a list of bills", async () => {
    document.body.innerHTML = BillsUI({ data: bills })
    const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
    const store = mockStore 
    const billsObject = new Bills ({document, onNavigate, store, localStorage: window.localStorage})
    const getBills = jest.fn(billsObject.getBills)
    
    expect(getBills()).toBeDefined();
  })

  