/*
 * Copyright (c) 2018-2019 Blacknet Team
 *
 * Licensed under the Jelurida Public License version 1.1
 * for the Blacknet Public Blockchain Platform (the "License");
 * you may not use this file except in compliance with the License.
 * See the LICENSE.txt file at the top-level directory of this distribution.
 */

$(document).ready(function () {

    const menu = $('.main-menu'), panel = $('.rightpanel'), apiVersion = "/api/v2", body = $("body");
    const hash = localStorage.hashIndex || 'overview';
    const dialogPassword = $('.dialog.password'),mask = $('.mask');
    let blockStack = [];
    let Mini_Lease = 1000;


    menu.find('a[data-index="' + hash + '"]').parent().addClass('active');
    
    
    function getMnemoic(){
        
        return $.trim(dialogPassword.find('.mnemonic').val());
    }
    function staking_click(type) {

        return function () {
            mask.show();
            dialogPassword.show().find('.confirm').unbind().on('click', function () {

                let mnemonic = getMnemoic();

                //验证助记词
                if(!Blacknet.verifyMnemonic(mnemonic)){
                    Blacknet.message("Invalid mnemonic", "warning")
                    dialogPassword.find('.mnemonic').focus()
                    return
                }   
                type == 'isstaking' ? refreshStaking(mnemonic, type) : changeStaking(mnemonic, type);
            });
        }
    }

    async function postStaking(mnemonic, type, callback){

        let url = '/' + type;
        let postdata = {
            mnemonic: mnemonic
        };
        Blacknet.post(url, postdata, callback, function () {
            clearPassWordDialog();
            timeAlert('Invalid mnemonic');
        });
    }

    async function refreshStaking(mnemonic, type) {

        let stakingText = $('.is_staking');
        stakingText.text('loading');
        clearPassWordDialog();
        await Blacknet.wait(1000);
        postStaking(mnemonic, type, function(ret){
            localStorage.isStaking = ret;
            stakingText.text(ret);
        });
    }

    async function changeStaking(mnemonic, type) {

        postStaking(mnemonic, type, function(ret){

            let msg = ret == 'false' ? 'FAILED!' :'SUCCESS!';

            timeAlert(type + ' ' + msg);
            clearPassWordDialog();
            refreshStaking(mnemonic, 'isstaking');
        });
    }

    function menuSwitch() {

        const target = $(this), index = target.find('a').attr('data-index');

        target.addClass('active').siblings().removeClass('active');
        panel.find('.' + index).show().siblings().hide();

        localStorage.hashIndex = index;

        if(index == 'cancel_lease') Blacknet.renderLease();
        if(index == 'overview'){
            Blacknet.balance();
            Blacknet.network();
        }
        if(index == 'transactions'){
            $('.transactions .filter .active').trigger('click');
        };
        return false;
    }

    function sign() {
        let mnemonic = $('#sign_mnemonic').val();
        mnemonic = $.trim(mnemonic);
        let message = $('#sign_message').val();
        
        if(!Blacknet.verifyMessage(message)){
            Blacknet.message("Invalid message", "warning")
            $('#sign_message').focus()
            return
        }

        let signedMessage = Blacknet.signMessage(message);
        $('#sign_result').text(signedMessage).parent().removeClass("hidden")
    }
    function verify() {
        let account = $('#verify_account').val();
        let signature = $('#verify_signature').val();
        let message = $('#verify_message').val();
        if(!Blacknet.verifyAccount(account)) {
            Blacknet.message("Invalid account", "warning")
            $('#verify_account').focus()
            return 
        }
        if(!Blacknet.verifySign(signature)){
            Blacknet.message("Invalid signature", "warning")
            $('#verify_signature').focus()
            return
        }
        if(!Blacknet.verifyMessage(message)){
            Blacknet.message("Invalid message", "warning")
            $('#verify_message').focus()
            return
        }

        let result = blacknetjs.VerifyMessage(account, signature, message);
        $('#verify_result').text(result).parent().removeClass("hidden")
    }

    function transfer_click(type) {
        return function () {
            let el = this;

            switch (type) {
                case 'send': transfer(); break;
                case 'lease': lease(); break;
                case 'cancel_lease': cancel_lease(el); break;
            }
        }
    }

    function input_mnemonic(fn){
        mask.show();
        dialogPassword.show().find('.confirm').unbind().on('click', function () {
            let mnemonic = getMnemoic();
            //验证助记词
            if(!Blacknet.verifyMnemonic(mnemonic)){
                Blacknet.message("Invalid mnemonic", "warning")
                dialogPassword.find('.mnemonic').focus()
                return
            }
            if(Object.prototype.toString.call(fn) === "[object Function]"){
                fn.call(this, mnemonic);
            }
        });
    }

    function transfer() {
        let to = $('#transfer_to').val();
        let amount = $('#transfer_amount').val();
        let message = $('#transfer_message').val();
        let encrypted = message && $('#transfer_encrypted').prop('checked') ? "1" : "0";
        if(!Blacknet.verifyAccount(to)) {
            Blacknet.message("Invalid account", "warning")
            $('#transfer_to').focus()
            return 
        }
        if(!Blacknet.verifyAmount(amount)) {
            Blacknet.message("Invalid amount", "warning")
            $('#transfer_amount').focus()
            return 
        }

        Blacknet.sendMoney(amount, to, message, encrypted);
    }

    function lease() {
        let to = $('#lease_to').val();
        let amount = $('#lease_amount').val();
        if(!Blacknet.verifyAccount(to)) {
            Blacknet.message("Invalid account", "warning")
            $('#lease_to').focus()
            return 
        }
        if(!Blacknet.verifyAmount(amount)) {
            Blacknet.message("Invalid amount", "warning")
            $('#lease_amount').focus()
            return 
        }

        if(+amount < Mini_Lease){
            Blacknet.message("Lease amount must > 1000 BLN", "warning")
            $('#lease_amount').focus()
            return
        }
        Blacknet.lease('lease', amount, to, 0);
    }


    function cancel_lease(el) {
        let data = el.dataset;
        let to = data.account;
        let amount = data.amount;
        let height = data.height;

        Blacknet.lease('cancelLease', amount, to, height);
    }

    function clearPassWordDialog() {
        mask.hide();
        dialogPassword.hide().find('.confirm').unbind();
        dialogPassword.find('.mnemonic').val('');
    }

    function timeAlert(msg, timeout) {
        setTimeout(function () {
            Blacknet.message(msg, "warning")
        }, timeout || 100);
    }

    function switchAccount() {

        localStorage.account = "";
        location.reload();
    }



    function newAccountNext() {

        let status = $('#confirm_mnemonic_warning').prop('checked');

        if (!status) {

            $('#confirm_mnemonic_warning_container label').css('color', 'red');
        } else {
            $('.account-input').hide();
            $('.newaccount.dialog,.mask').hide();
            Blacknet.init();
        }
        return false;
    }


    async function blockStackProcess() {

        let block;

        if (blockStack.length == 0) return;

        if (blockStack.length > 100) {

            blockStack = blockStack.slice(-35);
        }

        block = blockStack.shift();

        await Blacknet.renderBlock(block, block.height);
        await Blacknet.network();

        if (blockStack.length == 0) {
            Blacknet.refreshBalance();
            Blacknet.refreshTxConfirmations();
        }
    }

    setInterval(blockStackProcess, 100);

    function confirm_mnemonic_warning() {
        window.isGenerated = !this.checked;
    }

    async function addPeer() {
        let address = $('#ip_address').val(), port = $('#ip_port').val();

        if(!Blacknet.verifyNetworkAddress(address)) {
            Blacknet.message("Invalid address", "warning")
            $('#ip_address').focus()
            return 
        }
        if(!Blacknet.verifyNetworkPort(port)) {
            Blacknet.message("Invalid port", "warning")
            $('#ip_port').focus()
            return
        }

        let result = await Blacknet.getPromise(`/addpeer/${address}/${port}/true`);
        if(result == 'true') result = "Connected";

        await Blacknet.network();

        Blacknet.message(`${address} ${result}`, "success")

        $('#ip_address').val('');
    }

    async function disconnect(){

        let ret = await Blacknet.getPromise('/disconnectpeer/' + this.dataset.peerid + '/true');
        if(ret == 'true'){
            await Blacknet.getPeerInfo();
        }
    }


    async function renderTx(){

        let type = this.dataset.type;
        
        Blacknet.stopMoreTxs = true;
        $(this).addClass('active').siblings().removeClass('active');

        if(type == 'all'){
            await Blacknet.renderTxs(Blacknet.txIndex);
        }else{
            await Blacknet.renderTxs(Blacknet.txIndex, type);
        }
        Blacknet.stopMoreTxs = false;

    }

    function explorerSave(){

        let obj = Blacknet.explorer, el = $('.config');

        for(let key in obj){

            let v = el.find('#' + key).val();

            obj[key] = v;

        }

        localStorage.explorer = JSON.stringify(obj);
    }


    menu.on('click', 'li', menuSwitch);
    panel.find('.' + hash).show();

    body.on("click", "#stop_staking", staking_click('stopstaking'))
        .on("click", "#start_staking", staking_click('startstaking'))
        .on("click", "#refresh_staking", staking_click('isstaking'))
        .on("click", "#transfer", transfer_click('send'))
        .on("click", "#lease", transfer_click('lease'))
        .on("click", ".cancel_lease_btn", transfer_click('cancel_lease'))
        .on("click", "#sign", sign)
        .on("click", "#verify", verify)
        .on("click", "#add_peer_btn", addPeer)
        .on("click", "#switch_account", switchAccount)
        .on("click", "#new_account", Blacknet.generate)
        .on("input", "#confirm_mnemonic_warning", confirm_mnemonic_warning)
        .on("click", "#new_account_next_step", newAccountNext)
        .on("click", "#peer-table .disconnect", disconnect)
        .on("click", ".filter a", renderTx)
        .on('click', '#explorer_save', explorerSave)
        .on("click", ".tx-foot .show_more_txs", function(){
            $(this).hide();
            Blacknet.stopMore = false;
            Blacknet.showMoreTxs();
            return false;
        });


});

if (window.module) module = window.module;