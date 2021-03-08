import { LightningElement, api, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getOrderProducts from '@salesforce/apex/OrderProductsController.getOrderProducts';

    const columns = [
        {
            label: 'Name',
            fieldName: 'Name',
            type: 'text',
            sortable: true
        },
        {
            label: 'Unit Price',
            fieldName: 'UnitPrice',
            sortable: true,
            type: 'currency',
            typeAttributes: { currencyCode: 'EUR', step: '0.001'}
        },
        {
            label: 'Quantity',
            fieldName: 'Quantity',
            sortable: true,
            type: 'number'
        },
        {
            label: 'Total Price',
            fieldName: 'TotalPrice',
            sortable: true,
            type: 'currency',
            typeAttributes: { currencyCode: 'EUR', step: '0.001'}
        },
        
        ];
        
export default class OrderProducts extends LightningElement {

    @api recordId;

    @track value;
    @track error;
    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
   
    @track data = []; 
    @track columns; 

    @wire(getOrderProducts, {   orderId: '$recordId' 
        ,sortBy: '$sortedBy', sortDirection: '$sortedDirection'})
    wiredOrderProducts({ error, data }) {
        if (data) {
            debugger;
            let jsonData = JSON.parse(data);
            this.data = jsonData;
            this.columns = columns;
            this.error = undefined;
        } else if (error) {
            debugger;

            this.error = error;
            this.data = undefined;
        }
    }

    sortColumns( event ) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        return refreshApex(this.result);
        
    }
  
}