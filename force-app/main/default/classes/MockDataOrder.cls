public with sharing class MockDataOrder {

    public Account testAccount;
    public Product2 product;
    public PricebookEntry standardPrice;
    public Order order;
    public Id pricebookId;

    public MockDataOrder(){

                // Insert Account
    
                testAccount = new Account();
                testAccount.Name = 'Test Account';
                insert testAccount;
            
                // Insert Product
                product = new Product2();
                product.Name = 'Test Product ';
                product.Description='Test Product Entry 1';
                product.productCode = 'ABC';
                product.isActive = true;
                insert product;
                
            
                pricebookId= Test.getStandardPricebookId();
                
                // Insert PricebookEntry
            
                standardPrice = new PricebookEntry();
                standardPrice.Pricebook2Id = pricebookId;
                standardPrice.Product2Id = product.Id;
                standardPrice.UnitPrice = 1;
                standardPrice.IsActive = true;
                standardPrice.UseStandardPrice = false;
                insert standardPrice ;
                
        
                // Insert Order
                
                order = new Order();
                order.Name = 'Test Order ';
                order.Status = 'Draft';
                order.EffectiveDate = system.today();
                order.EndDate = system.today() + 4;
                order.AccountId = testAccount.id;
                order.Pricebook2Id =  pricebookId ;
                
                insert order;

                // Insert Order Item

                OrderItem orderItem = new OrderItem();
                orderItem.OrderId = order.id;
                orderItem.Quantity = 24;
                orderItem.UnitPrice = 240;
                orderItem.Product2id = product.id;
                orderItem.PricebookEntryId=standardPrice.id;
                insert orderItem;
                
    }

    public MockDataOrder(boolean noOrderItem) {
 
                // Insert Account
    
                testAccount = new Account();
                testAccount.Name = 'Test Account';
                insert testAccount;
            
                // Insert Product
                product = new Product2();
                product.Name = ' Test Product ';
                product.Description='Test Product Entry 1';
                product.productCode = 'ABC';
                product.isActive = true;
                insert product;
                
            
                pricebookId= Test.getStandardPricebookId();
                
                // Insert PricebookEntry
            
                standardPrice = new PricebookEntry();
                standardPrice.Pricebook2Id = pricebookId;
                standardPrice.Product2Id = product.Id;
                standardPrice.UnitPrice = 1;
                standardPrice.IsActive = true;
                standardPrice.UseStandardPrice = false;
                insert standardPrice ;
                
        
                // Insert Order
                
                order = new Order();
                order.Name = 'Test Order ';
                order.Status = 'Draft';
                order.EffectiveDate = system.today();
                order.EndDate = system.today() + 4;
                order.AccountId = testAccount.id;
                order.Pricebook2Id =  pricebookId ;
                
                insert order;
       
}
}
