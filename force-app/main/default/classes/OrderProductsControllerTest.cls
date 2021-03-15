@isTest
public with sharing class OrderProductsControllerTest {
    
    @isTest static void testGetAvailableProducts(){
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        // Call method to test.
        // This causes a fake response to be sent
        // from the class that implements HttpCalloutMock. 
        Map<String,String> response = OrderProductsController.updateExternalRecord('test');

        System.assertEquals('true', response.get('success'));
    }

    @isTest static void getOrderProducts(){
        MockDataOrder data = new MockDataOrder();

        String response = OrderProductsController.getOrderProducts(data.order.id, 'Name', 'ASC');
		Boolean result=response.contains('Test Product');
        System.assert(result);
    }
}