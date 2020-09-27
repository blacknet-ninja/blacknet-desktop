/*
 * Copyright (c) 2018-2020 Blacknet Team
 *
 * Licensed under the Jelurida Public License version 1.1
 * for the Blacknet Public Blockchain Platform (the "License");
 * you may not use this file except in compliance with the License.
 * See the LICENSE.txt file at the top-level directory of this distribution.
 */



Blacknet.template = {


    transaction: async function (tx, account) {

        //TODO MultiData
        let dataType = tx.type;
        let txData = tx.data;

        let amount = txData.amount, tmpl, txfee, type, txaccount = tx.from;

        type = Blacknet.getTxTypeName(tx, dataType);
        txfee = Blacknet.getFormatBalance(tx.fee);

        if (dataType == 254) {
            txfee = '';
        }
        if (dataType == 0 && tx.from == account) {
            txaccount = txData.to;
        }
        let txText = type, linkText = '';


        if(dataType == 0){
            let text = account == tx.from ? "Sent to" : 'Received from';
            txText = `<a target="_blank" href="${Blacknet.explorer.tx + tx.txid.toLowerCase()}">${text}</a>`
        }

        if(dataType == 2 || dataType == 3){
            // txText = `<a target="_blank" href="${Blacknet.explorer.tx + tx.txid.toLowerCase()}">
            // ${type} ${account == tx.from ? "to" : 'from'}</a>`;
            txText = `<a target="_blank" href="${Blacknet.explorer.tx + tx.txid.toLowerCase()}">
            ${type}</a>`;
        }

        if(dataType != 254 && dataType != 0 && dataType != 2 && dataType != 3){
            txText = `<a target="_blank" href="${Blacknet.explorer.tx + tx.txid.toLowerCase()}">${type}</a>`;
        }

        if(dataType == 0 || dataType == 2 || dataType == 3){

            if(account == tx.from){
                linkText = `<a target="_blank" class="address" href="${Blacknet.explorer.account + txData.to}">${txData.to}</a>`;
            }else{
                linkText = `<a target="_blank" class="address" href="${Blacknet.explorer.account + tx.from}">${tx.from}</a>`;
            }
        }

        if(dataType != 0 && dataType != 2 && dataType != 3){

            if(tx.from != 'genesis'){
                linkText = `<a target="_blank" class="address" href="${Blacknet.explorer.account + tx.from}">${tx.from}</a>`;
            }else{
                linkText = `<a target="_blank" class="address" href="${Blacknet.explorer.account + tx.to}">${tx.to}</a>`;
            }
        }
        amount = Blacknet.getFormatBalance(amount);

        tmpl =
            `<tr class="preview txhash${tx.hash} tx-item" data-time="${tx.time}" data-hash="${tx.hash}"  data-height="${tx.height}">
                <td class="narrow">${Blacknet.unix_to_local_time(tx.time)}</td>
                <td class="narrow typee">${txText}</td>
                <td class="left">${linkText}</td>
                <td class="right"><span class="strong">${amount}</span></td>
            </tr>`;


        let node = $(tmpl), msgNode = node.find('.message'), message;

        if (dataType == 0) {
            if (txData.message.type == 0) {
                message = txData.message.message;
            } else if (txData.message.type == 1) {
                message = "Encrypted message";
            } else {
                message = "Non-standard message";
            }
            msgNode.text(message);
        }

        if (!message) node.find('.msg_text').hide();
        if (dataType == 254) {
            node.find('.sign_text,.to,.fee').hide();
        }
        return node;
    },


    lease: function(tx, index){
        let link = `<a target="_blank" href="${Blacknet.explorer.account + tx.publicKey}">${tx.publicKey}</a>`
        let amount = Blacknet.getFormatBalance(tx.amount);
        let tmpl =
            `<tr class="leases">
                <td>${index + 1}</td>
                <td>${link}</td>
                <td>${tx.height}</td>
                <td>${amount}</td>
                <td><a href="#" class="cancel_lease_btn"
                                data-account="${tx.publicKey}" 
                                data-amount="${amount.slice(0,-4)}"
                                data-height="${tx.height}">Cancel</a></td>
            </tr>`;

        $(tmpl).appendTo("#leases-list");
    },

    contact: function (contact, index) {
        let tmpl =
            `<tr>
                <td class="c_account">${contact.account}</td>
                <td class="c_name">${contact.name}</td>
            </tr>`;
        $(tmpl).appendTo(".contacts-dialog #contact-list");
    },

    block: async function (blockListEl, block, height, prepend = true) {

        let op = prepend ? 'prependTo' : 'appendTo';

        let tmpl = `<tr><td class="narrow height">
                        <a target="_blank" href="${Blacknet.explorer.blockHeight + height}">${height}</a>
                    </td>
                    <td class="size narrow">${block.size}</td>
                    <td class="time narrow">${Blacknet.unix_to_local_time(block.time)}</td>
                    <td class="txns narrow">${block.transactions.length}</td>
                    <td class="generator">
                        <a target="_blank" href="${Blacknet.explorer.account + block.generator}">${block.generator}</a>
                    </td></tr>`;

        $(tmpl)[op](blockListEl);

        let rowsCount = blockListEl[0].childNodes.length;

        if (rowsCount > 36) {
            blockListEl.find('tr:last-child').remove();
        }
    },

    message: async function (msg, type, duration) {
        var icon;
        clearTimeout(this.timerid);
        switch (type) {
            case "success":
                icon = '<i class="fa fa-check-circle"></i>'
                break;
            case "error":
                icon = '<i class="fa fa-times-circle"></i>';
                break;
            case "warning":
                icon = '<i class="fa fa-info-circle"></i>';
                break;
            default:
                icon = ''
                break;
        }
        var messageText = `<div class="blacknet-message-notice">
            <div class="blacknet-message-notice-content">${icon}${msg}
            </div>
        </div>`;
        var $msg = $(messageText)
        console.log(duration)
        $(".blacknet-message").append($msg)
        this.timerid = setTimeout(function () {
            $msg.remove()
        }, duration || 2000)
       
    },

    pinMessage : function(msg) {
        
        if(!this.msg){
            var messageText = `<div class="blacknet-message-notice">
                <div class="blacknet-message-notice-content">${msg}
                </div>
            </div>`;
            this.$msg = $(messageText)
            $(".blacknet-message").append(this.$msg)
        }

        this.$msg.show().find('.blacknet-message-notice-content').text(msg);
    },
    hidePinMessage: function(){
        this.$msg.hide();
    }


};