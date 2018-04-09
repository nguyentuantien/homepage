function PaymentCart(){
    
    var PaymentItems=[{
        key:"webbuilder",
        code:"L1",
        name:"Website Builder",
        price:{
            basic:999000,
            premium:2999000,
            vip:3999000
        }
    },{
        key:"frontend",
        code:"L2",
        name:"Front End",
        price:{
            basic:1799000,
            premium:7999000,
            vip:8999000
        }
    },{
        key:"backend",
        code:"L3",
        name:"Back End",
        price:{
            basic:3999000,
            premium:7999000,
            vip:8999000
        }
    }];

    var store  = new Store();
    
    this.add = function(key){
        store.set(key,true);
    }
    
    this.remove = function(key){
        store.set(key,false);
    }
    
    this.toggleItem = function(key){
        var cached = store.get(key);
        if(!cached || JSON.parse(cached||'')===false){
            store.set(key,true);
            return;
        }
        store.set(key,false);
    }
    
    this.isSelected = function(item){
        var cached = store.get(item.key);
        if(!cached || JSON.parse(cached||'')===false){
            return false;
        }
        return true;
    }
    
    this.getAll = function(){
        return PaymentItems;
    }
    
    this.getAvailableItems=function(){
        var items=[];
        for(var index in PaymentItems){
            var item = PaymentItems[index];
            if(JSON.parse(store.get(item.key)|| '')===true){
                items.push(item);
            }
        }
        
        return items;
    }
    
    this.getPriceForService= function(service){
        var amount =0;
        var selectedItems = this.getAvailableItems();
        for(var index in selectedItems){
            var item = selectedItems[index];
            amount += item.price[service];
        }
        return amount.toLocaleString('vi-VN');
    }
    
    this.getCurrentService = function(){
        return localStorage.getItem('service') || 'premium';
    }
    
    this.setCurrentService = function(service){
        localStorage.setItem('service',service);
    }
    
    this.getItemsByField = function(field){
        return this.getAvailableItems().map(function(item){
            return item[field];
        }).join(',');
    }
    
    
    function Store(){

        this.get = function(key){
            return localStorage.getItem(key);
        };

        this.set = function(key,value){
            localStorage.setItem(key,value);
        }
    }
}

function PaymentPage(){
    var paymentCart = new PaymentCart();
    
    this.render = function(){
        var items = paymentCart.getAll();
        var isSelection = paymentCart.getAvailableItems().length>0;
        var displayPaymentPanel='';
        
        for(var index in items){
            var item = items[index];
            var checkButton   = '#' + item.key + ' .learn-plan-content .select-button';
            var button   = '#' + item.key + ' .learn-plan-content button';
            var checker  = '#' + item.key + ' .learn-plan-content .select-check';
            if(paymentCart.isSelected(item)){
                document.querySelector(checkButton).classList.remove('hidden');
                document.querySelector(button).textContent='Bỏ chọn';
                document.querySelector(checker).checked=true;
            }else{
                document.querySelector(checkButton).classList.add('hidden');
                document.querySelector(button).textContent='Chọn';
                document.querySelector(checker).checked=false;
            }
        }
        if(isSelection){
            displayPaymentPanel='block';
        }else{
            displayPaymentPanel='none';
        }
        document.querySelector('#payment-panel').style.display=displayPaymentPanel;
        renderOrder();
    }
    
    function renderOrder(){
        // render price service table
        var service = paymentCart.getCurrentService()
        document.querySelector('.price#basic > strong').textContent = paymentCart.getPriceForService('basic');
        document.querySelector('.price#premium > strong').textContent = paymentCart.getPriceForService('premium');
        document.querySelector('.price#vip > strong').textContent = paymentCart.getPriceForService('vip');
        document.querySelector('#name-course').textContent = paymentCart.getItemsByField('name');   
        document.querySelector('#name-course-code').textContent = paymentCart.getItemsByField('code');   
        document.querySelector('#name-option').textContent =service;   
        document.querySelector('#sum-price').textContent =paymentCart.getPriceForService(service);
        document.querySelector('#reg-date').textContent =new Date().toLocaleDateString('vi-VN');
    }
    
    function getParentMatching(target,selector){
        
        do{
            target = target.parentElement;    
        }while(target && target!==document && !target.classList.contains(selector));
        
        return target;
    }
    this.init = function(){
        this.render();
        
        var rerender = this.render;
        
        document.addEventListener('click',function(evt){
            
            if(evt.target && evt.target.matches('.btn-register, .select-check')){
              var finder = getParentMatching(evt.target,'learn-plan-content');
                
              if(!finder){return;}
                
              paymentCart.toggleItem(finder.getAttribute('data-key'));
              rerender();
            }else if(evt.target.matches('.btn-payment')){
                paymentCart.setCurrentService(evt.target.getAttribute('data-service'));
                renderOrder();
            }
        });
    }
}

window.paymentPageHandler  = new PaymentPage().init();