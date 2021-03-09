import { LightningElement, api, track, wire } from 'lwc';
import Pricebook2Id from '@salesforce/schema/order.Pricebook2Id';
import Status from '@salesforce/schema/order.Status';

import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getAvailableProducts from '@salesforce/apex/AvailableProductsController.getAvailableProducts';

const FIELDS = [
    Pricebook2Id,
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
        label: 'List Price',
        fieldName: 'UnitPrice',
        sortable: true,
        type: 'currency',
        typeAttributes: { currencyCode: 'EUR', step: '0.001'}
    },{
        label: 'Add Product',
        type: 'button-icon',
        initialWidth: 75,
        typeAttributes: {
            iconName: 'utility:cart',
            title: 'Add Product',
            variant: 'border-filled',
            alternativeText: 'Add Product'
        }
    }
    ];


export default class AvailableProducts extends LightningElement {
    @api recordId;
    
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    order;
    @track value;
    @track error;
    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
    @api searchKey = '';
   
    @track data = []; 
    @track columns; 

    @wire(getAvailableProducts, {   pricebook2Id: '$order.data.fields.Pricebook2Id.value' 
        ,searchKey: '$searchKey', sortBy: '$sortedBy', sortDirection: '$sortedDirection'})
    wiredAvailableProducts({ error, data }) {
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
  
    handleKeyChange( event ) {
        if(event.target.value.length >= 3){
            this.searchKey = event.target.value;
            return refreshApex(this.result);
        }
    }
    isLoading() {
        return !this.wiredProperty.data && !this.wiredProperty.error;
    }

    callRowAction( event ) {  
        debugger;
        const recId =  event.detail.row.Id;
        const title =  event.detail.action.title;  

        if ( recId && title && title === 'Add Product' ) {  
            debugger;
        }          
      
    }  
     
    get isActive() {    
        return getFieldValue(this.order.data, Status) == 'Activated';
    }
    
}
