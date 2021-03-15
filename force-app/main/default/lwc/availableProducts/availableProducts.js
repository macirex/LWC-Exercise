import { LightningElement, api, track, wire } from 'lwc';
import Pricebook2Id from '@salesforce/schema/order.Pricebook2Id';
import Status from '@salesforce/schema/order.Status';

import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getAvailableProducts from '@salesforce/apex/AvailableProductsController.getAvailableProducts';
import addProductToOrder from '@salesforce/apex/AvailableProductsController.addProductToOrder';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import orderProductMessageChannel from '@salesforce/messageChannel/orderProduct__c';
import {publish, MessageContext} from 'lightning/messageService'
/* I could have used normal Javascript events, but then I thought about scalability and then decided to use Salesforce own Message Service/Events*/

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
    //I know that track is deprecated on the latest LWC release, but I got used to see it, that's why I still use it.

    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
    @api searchKey = '';
   
    @track data = []; 
    @track columns; 
    @track isLoading=true; 

    @wire(MessageContext)
    messageContext;

    @track wiredAvailableProducts;

    @wire(getAvailableProducts, { orderId: '$recordId', pricebook2Id: '$order.data.fields.Pricebook2Id.value' 
        ,searchKey: '$searchKey', sortBy: '$sortedBy', sortDirection: '$sortedDirection'})
    getAvailableProductsCallback(response) {
        this.wiredAvailableProducts = response;
        const data = response.data;
        const error = response.error;
        if (data) {
            let jsonData = JSON.parse(data);
            this.data = jsonData;
            this.columns = columns;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
        this.isLoading=false;
    }

    sortColumns( event ) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        return this.selfRefresh();
        /*
            Not my ideal way of doing the sorting as this add and additional API Call, 
            I could have done it in pure JS but it's time consuming and I wanted to deliver this as fast as possible.
        */
    }
  
    handleKeyChange( event ) {
            this.searchKey = event.target.value;
            return this.selfRefresh();
            /*
                Not my ideal way of doing the search as this add an additional API Call, 
                I could have done it in pure JS but it's time consuming and I wanted to deliver this as fast as possible.
            */
    }

    callRowAction( event ) {  
        let rowData =  event.detail.row;
        rowData.OrderId = this.recordId;
        rowData.Pricebook2Id = this.order.data.fields.Pricebook2Id.value;
        const title =  event.detail.action.title;  

        if ( rowData && title && title === 'Add Product' ) {  
            addProductToOrder({data: rowData}).then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Product successfully added',
                        variant: 'success'
                    })
                );
                publish(this.messageContext, orderProductMessageChannel, {recordData:{}});
            })
            .catch(error => {
                debugger;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Product could not be added',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });


        }          
      
    }  

    selfRefresh(){
        this.isLoading=true;
        return refreshApex(this.wiredAvailableProducts);
    }
     
    get isActive() {    
        return getFieldValue(this.order.data, Status) == 'Activated';
    }
}
