import { LightningElement, api, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getOrderProducts from '@salesforce/apex/OrderProductsController.getOrderProducts';
import Status from '@salesforce/schema/order.Status';
import Id from '@salesforce/schema/order.Id';
import StatusCode from '@salesforce/schema/order.StatusCode';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

    const FIELDS = [
        Status
    ];

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
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    order;

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

    clickHandler(){
        const fields = {};
        fields[Id.fieldApiName] = this.recordId;
        fields[Status.fieldApiName] = 'Activated';
        fields[StatusCode.fieldApiName] = 'A';

        const orderRecord = { fields };
        debugger;
        updateRecord(orderRecord)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Order Activated',
                            variant: 'success'
                        })
                    );
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Order could not be activated',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
    }
  
    get isActive() {    
        return getFieldValue(this.order.data, Status) == 'Activated';
    }
}