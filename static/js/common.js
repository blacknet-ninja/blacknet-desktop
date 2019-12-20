/*
 * Copyright (c) 2018-2019 Blacknet Team
 *
 * Licensed under the Jelurida Public License version 1.1
 * for the Blacknet Public Blockchain Platform (the "License");
 * you may not use this file except in compliance with the License.
 * See the LICENSE.txt file at the top-level directory of this distribution.
 */

void function () {

    const Blacknet = {};
    const DEFAULT_CONFIRMATIONS = 10;
    const GENESIS_TIME = 1545555600;
    const apiVersion = "https://blnmobiledaemon.blnscan.io/api/v2", body = $("body");;
    const progressStats = $('.progress-stats, .progress-stats-text');
    const dialogPassword = $('.dialog.password'), dialogConfirm = $('.dialog.confirm'), mask = $('.mask');
    
    const dialogAccount = $('.dialog.account');
    const notificationNode = $('.notification.tx').first();
    const txList = $('#tx-list');
    const explorerApi = "https://blnscan.io/api";

    const bln = new blacknetjs();
    let mnemonic, currentAccount;

    Blacknet.explorer = {
        block: 'https://blnscan.io/',
        blockHeight: 'https://blnscan.io/',
        tx: 'https://blnscan.io/',
        account: 'https://blnscan.io/'
    };

    if (localStorage.explorer) {
        Blacknet.explorer = JSON.parse(localStorage.explorer);
    }

    Blacknet.init = async function () {

        await Blacknet.wait(1000);

        if (mnemonic) {

            mask.removeClass('init').hide();
            dialogAccount.hide();
            Blacknet.showProgress();

            $('.overview').find('.overview_account').text(currentAccount);
            Blacknet.ready();
            mask.on('click', function () {
                mask.hide();
                dialogPassword.hide();
                dialogConfirm.hide();
            });
        } else {
            dialogAccount.find('.spinner').hide();
            dialogAccount.find('.account-input').show();
            dialogAccount.find('.enter').unbind().on('click', async function () {

                mnemonic = dialogAccount.find('.account_text').val();
                mnemonic = $.trim(mnemonic);
                currentAccount = blacknetjs.Address(mnemonic);

                if (Blacknet.verifyMnemonic(mnemonic) && currentAccount) {
                    
                } else {

                    Blacknet.message("Invalid mnemonic", "warning")
                    dialogAccount.find('.account_text').focus()
                    return;
                }
            });
        }
    };
    Blacknet.generate =  function() {
        
        $('.account.dialog').hide();
        $('.newaccount.dialog').show();

        mnemonic = blacknetjs.Mnemonic();
        currentAccount = blacknetjs.Address(mnemonic);

        $('#new_account_text').val(currentAccount);
        $('#new_mnemonic').val(mnemonic);
        window.isGenerated = true;
    }


    Blacknet.balance = async function () {

        let balance = $('.overview_balance'),
            confirmedBalance = $('.overview_confirmed_balance'),
            stakingBalance = $('.overview_staking_balance'),
            inLeasesBalance = $('.inLeasesBalance'),
            outLeasesBalance = $('.outLeasesBalance'),
            realBalance = $('.realBalance');;
            
        $.getJSON(explorerApi + '/account/ledger/' + currentAccount, function (data) {
            balance.html(Blacknet.toBLNString(data.balance));
            confirmedBalance.html(Blacknet.toBLNString(data.confirmedBalance));
            stakingBalance.html(Blacknet.toBLNString(data.stakingBalance));

            inLeasesBalance.html(Blacknet.toBLNString(data.inLeasesBalance || 0));
            outLeasesBalance.html(Blacknet.toBLNString(data.outLeasesBalance || 0));
            realBalance.html(Blacknet.toBLNString(data.realBalance || 0));

        }).fail(function () {
            balance.html('0.00000000 BLN');
        });
    };

    Blacknet.toBLNString = function (number) {
        return new BigNumber(number).dividedBy(1e8).toFixed(8) + ' BLN';
    };



    Blacknet.renderStatus = function () {

        let network = $('.network');
        let warnings = $('.overview_warnings'), warnings_row = $('.overview_warnings_row');
        let ledger = Blacknet.ledger, nodeinfo = Blacknet.nodeinfo;

        network.find('.height').html(ledger.height);
        network.find('.supply').html(new BigNumber(ledger.supply).dividedBy(1e8).toFixed(0));
        network.find('.connections').text(nodeinfo.outgoing + nodeinfo.incoming);
        $('.overview_version').text(nodeinfo.version);

        if (nodeinfo.warnings.length > 0) {
            warnings.text(nodeinfo.warnings);
            warnings_row.show();
        } else {
            warnings.text("");
            warnings_row.hide();
        }
    };

    Blacknet.renderOverview = async function () {

        let ledger = Blacknet.ledger;

        for (let key in ledger) {

            let value = ledger[key];
            if (key == 'blockTime') {
                value = Blacknet.unix_to_local_time(value);
                Blacknet.renderProgressBar(ledger[key]);
            } else if (key == 'height') {
                $('.overview_height').prop('href', Blacknet.explorer.blockHeight + value);
            } else if (key == 'blockHash') {
                $('.overview_blockHash').prop('href', Blacknet.explorer.block + value);
            } else if (key == 'supply') {
                value = new BigNumber(value).dividedBy(1e8) + ' BLN';
            }
            $('.overview_' + key).text(value);
        }

        // let staking = await Blacknet.getPromise('/staking');

        // for (let key in staking) {

        //     $('.staking_info').find('.' + key).text(staking[key]);
        // }

    };

    Blacknet.renderProgressBar = async function (timestamp) {

        let secs = Date.now() / 1000 - timestamp, totalSecs, pecent, timeBehindText = "", now = Date.now();
        let HOUR_IN_SECONDS = 60 * 60;
        let DAY_IN_SECONDS = 24 * 60 * 60;
        let WEEK_IN_SECONDS = 7 * 24 * 60 * 60;
        let YEAR_IN_SECONDS = 31556952; // Average length of year in Gregorian calendar

        if (secs < 5 * 60) {
            timeBehindText = undefined;
        } else if (secs < 2 * DAY_IN_SECONDS) {
            timeBehindText = (secs / HOUR_IN_SECONDS).toFixed(2) + " hour(s)";
        } else if (secs < 2 * WEEK_IN_SECONDS) {
            timeBehindText = (secs / DAY_IN_SECONDS).toFixed(2) + " day(s)";
        } else if (secs < YEAR_IN_SECONDS) {
            timeBehindText = (secs / WEEK_IN_SECONDS).toFixed(2) + " week(s)";
        } else {
            let years = secs / YEAR_IN_SECONDS;
            let remainder = secs % YEAR_IN_SECONDS;
            timeBehindText = years.toFixed(2) + " year(s) and " + remainder.toFixed(2) + "week(s)";
        }

        if (!Blacknet.startTime) {
            Blacknet.startTime = GENESIS_TIME;
        }
        Blacknet.timeBehindText = timeBehindText;

        if (timeBehindText == undefined) {
            progressStats.hide();
            return;
        }

        totalSecs = Date.now() / 1000 - Blacknet.startTime;
        pecent = (secs * 100) / totalSecs;

        pecent = 100 - pecent;

        $('.progress-bar').css('width', `${pecent}%`);
        $('.progress-stats-text').text(timeBehindText + " behind");
    }

    Blacknet.showProgress = function () {

        if (Blacknet.timeBehindText != undefined) {
            progressStats.show();
        }
    };

    Blacknet.get = function (url, callback) {

        return $.get(apiVersion + url, callback);
    };

    Blacknet.getPromise = function (url, type) {

        return type == 'json' ? $.getJSON(url) : $.get(url);
    };

    Blacknet.post = function (url, data, callback, fail) {

        let options = {
            url: apiVersion + url,
            data: data,
            type: 'POST',
            success: callback,
            fail: fail
        };

        return $.ajax(options);
    };

    Blacknet.postPromise = function (url, data, isNeedAlert) {

        return $.post(apiVersion + url, data).fail(function (res) {
            if (isNeedAlert && res.responseText) alert(res.responseText);
        });
    };

    Blacknet.sendMoney = function (amount, to, message, encrypted) {

        let fee = 100000, amountText;

        amountText = new BigNumber(amount).toFixed(8);
        amount = new BigNumber(amount).times(1e8).toNumber();

        Blacknet.confirm('Are you sure you want to send?\n\n' + amountText + ' BLN to \n' +
            to + '\n\n0.001 BLN added as transaction fee?', function (flag) {
                if (!flag)  return;

                Blacknet.template.pinMessage("Request Pending...");
                let from = blacknetjs.Address(mnemonic);
                
                bln.jsonrpc.transfer(mnemonic, {
                    fee: fee,
                    amount: amount,
                    message: message,
                    from: from,
                    to: to,
                    encrypted: encrypted
                }).then((res)=>{
                    Blacknet.template.hidePinMessage();
                    if(res.body.length == 64){
                        $('#transfer_result').text(res.body).parent().removeClass("hidden");
                    }else{
                        Blacknet.message(res.body, "warning");
                    }
                    Blacknet.clearPassWordDialog();
                });
            })
    };
    Blacknet.clearPassWordDialog = function() {
        mask.hide();
        dialogPassword.hide().find('.confirm').unbind();
        dialogPassword.find('.mnemonic').val('');
    }

    Blacknet.lease = function (type, amount, to, height) {

        let fee = 100000, amountText, type_text = type == 'lease' ? 'lease' : 'cancel lease';

        let from = blacknetjs.Address(mnemonic);

        amountText = new BigNumber(amount).toFixed(8);
        amount = new BigNumber(amount).times(1e8).toNumber();
        let data = {
            fee: fee,
            amount: amount,
            from: from,
            to: to
        };

        Blacknet.confirm('Are you sure you want to ' + type_text + '?\n\n' + amountText +
            ' BLN to \n' + to + '\n\n0.001 BLN added as transaction fee?', function (flag) {
                if (!flag) return;
                
                if(type == 'cancelLease') data.height = height;
                
                Blacknet.template.pinMessage("Request Pending...");
                bln.jsonrpc[type](mnemonic, data).then((res)=>{
                    Blacknet.template.hidePinMessage();
                    if(res.body.length == 64 && type == 'cancelLease' ){
                        Blacknet.message("Cancel Lease Success", "success");
                        $('#cancel_lease_result').text(res.body).parent().removeClass("hidden")
                        Blacknet.renderLease();
                    }else if(res.body.length == 64 && type == 'lease'){
                        Blacknet.message("Lease Success", "success");
                        $('#lease_result').text(res.body).parent().removeClass("hidden")
                    }else{
                        Blacknet.message(res.body, "warning");
                    }
                    Blacknet.clearPassWordDialog();
                });
            });
    };

    Blacknet.wait = function (timeout) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, timeout);
        });
    };

    Blacknet.unix_to_local_time = function (unix_timestamp) {

        let date = new Date(unix_timestamp * 1000);
        let hours = "0" + date.getHours();
        let minutes = "0" + date.getMinutes();
        let seconds = "0" + date.getSeconds();
        let day = date.getDate();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;

        return year + "-" + ('0' + month).substr(-2) + "-" +
            ('0' + day).substr(-2) + " " + hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    }

    Blacknet.initRecentTransactions = async function () {
        // let transactions = await Blacknet.getPromise(explorerApi + '/account/txns/' + currentAccount, 'json');
        await Blacknet.renderTxs();
    };

    Blacknet.renderTxs = async function (arr, type) {

        let defaultTxAmount = 100, txProgress = $('.tx-progress'),
            showMore = $('.tx-foot .show_more_txs'),
            noTxYet = $('.tx-foot .no_tx_yet');
        type = type || '';
        txList.find('.preview').remove();
        txList.find('.loading-spinner').show();
        noTxYet.hide();
        let txArray = await Blacknet.getPromise(explorerApi + '/account/txns/' + currentAccount + '?type=' + type, 'json');

        if (txArray.length == 0) {
            noTxYet.show();
            showMore.hide();
        } else {
            noTxYet.hide();
        }

        txProgress.hide();
        
        txList.find('.loading-spinner').hide();
        for (let tx of txArray) {

            await Blacknet.renderTransaction(tx);
        }

        defaultTxAmount < 0 ? showMore.show() : showMore.hide();

    };


    Blacknet.showMoreTxs = async function () {

        let transactions = Blacknet.currentTxIndex.slice(100);
        let node = $('.tx-item:last-child');

        time = +node[0].dataset.time || 0;

        for (let tx of transactions) {

            if (Blacknet.stopMore == false) {
                await Blacknet.renderTransaction(tx);
            }
        }
    };
    Blacknet.stopMoreTxs = function () {
        Blacknet.stopMore = true;
    }

    Blacknet.renderTransaction = async function (tx, prepend) {

        let node = txList.find('.txhash' + tx.height + tx.time);
        if (typeof tx.height == 'undefined') {
            tx.height = 0;
        }
        // if tx already render, update status
        if (node.html()) {
            await Blacknet.renderTxStatus(0, node[0]);
            return;
        }

        node = await Blacknet.template.transaction(tx, currentAccount);
        prepend ? node.prependTo(txList) : node.appendTo(txList);

    };

    Blacknet.renderLease = async function () {

        let nomore = $('#leases-list').find('.no_out_leases_msg'), loading = $('#leases-list').find('.loading-spinner');
        loading.show();
        nomore.hide();
        $('#leases-list').find('.leases').remove();

        let outLeases = await Blacknet.getPromise(explorerApi + '/outleases/' + currentAccount);
        

        loading.hide();
        if (outLeases.length > 0) {
            outLeases.map(Blacknet.template.lease);

        }else{
            nomore.show();
        }
    };

    Blacknet.getStatusText = async function (height, hash) {

        let confirmations = Blacknet.ledger.height - height + 1, statusText = 'Confirmed';
        if (height == 0) {

            confirmations = await Blacknet.getPromise('/wallet/confirmations/' + currentAccount + '/' + hash);
            statusText = `${confirmations} Confirmations`;

        } else if (confirmations < DEFAULT_CONFIRMATIONS) {

            statusText = `${confirmations} Confirmations`;
        }
        return statusText;
    };

    Blacknet.getTxTypeName = function (tx, type) {
        let typeNames = [
            "Transfer",
            "Burn",
            "Lease",
            "CancelLease",
            "Bundle",
            "CreateHTLC",
            "UnlockHTLC",
            "RefundHTLC",
            "SpendHTLC",
            "CreateMultisig",
            "SpendMultisig",
            "WithdrawFromLease",
            "ClaimHTLC"
        ];

        let name = typeNames[type];

        if (type == 16) {
            name = "MultiData";
        } else if (type == 254) {
            name = "Generated";
        } else if (type == 0) {
            if (tx.from == currentAccount) {
                name = "Sent to";
            } else {
                name = "Received from";
            }
        }
        return name;
    };

    Blacknet.getFormatBalance = function (balance) {

        return new BigNumber(balance).dividedBy(1e8).toFixed(8) + ' BLN';
    };

    Blacknet.renderTxStatus = async function (index, el) {

        let statusText, node = $(el).find('.status');

        if (node.text() == 'Confirmed') return;

        statusText = await Blacknet.getStatusText(el.dataset.height, el.dataset.hash);
        node.text(statusText);
    };



    Blacknet.refreshTxConfirmations = function () {

        $.each($('#tx-list tr'), Blacknet.renderTxStatus);
    };

    Blacknet.throttle = function (fn, threshhold = 250) {

        let last, timer;

        return function () {

            let context = this;
            let args = arguments;
            let now = +new Date();

            if (last && now < last + threshhold) {
                clearTimeout(timer);

                timer = setTimeout(function () {
                    last = now;
                    fn.apply(context, args);
                }, threshhold);

            } else {
                last = now;
                fn.apply(context, args);
            }
        }
    }
    


    Blacknet.ready = async function (callback) {

        let lang = navigator.language || navigator.userLanguage;
        if (lang.indexOf('zh') !== -1) {
            i18n({ locale: 'zh' });
        } else if (lang.indexOf('ja') !== -1) {
            i18n({ locale: 'ja' });
        } else if (lang.indexOf('sk') !== -1) {
            i18n({ locale: 'sk' });
        } else if (lang.indexOf('de') !== -1) {
            i18n({ locale: 'de' });
        }
        Blacknet.initExplorer();

        await Blacknet.balance();
        await Blacknet.network();

        if (currentAccount) {
            await Blacknet.initRecentTransactions();
            Blacknet.renderLease();
        }
    };

    Blacknet.refreshBalance = async function () {

        await Blacknet.balance();
    };

    Blacknet.signMessage =  function (message) {
        if(!Blacknet.verifyMnemonic(mnemonic)){
            Blacknet.message("Invalid mnemonic", "warning")
            $('#sign_mnemonic').focus()
            return
        }
        return  blacknetjs.SignMessage(mnemonic, message);
    };

    Blacknet.initExplorer = function () {

        let obj = Blacknet.explorer;
        for (let key in obj) {

            $('.config').find('#' + key).val(obj[key]);
        }

    };

    
    Blacknet.network = async function () {

        Blacknet.ledger = await Blacknet.getPromise( apiVersion + '/ledger', 'json');
        Blacknet.nodeinfo = await Blacknet.getPromise(apiVersion +  '/node', 'json');

        Blacknet.renderStatus();
        Blacknet.renderOverview();

    };

    Blacknet.verifyMnemonic = function (mnemonic) {
        if (Object.prototype.toString.call(mnemonic) === "[object String]"
            && mnemonic.split(" ").length == 12) {
            return true
        }
        return false
    }
    
    Blacknet.verifyAccount = function (account) {
        if (Object.prototype.toString.call(account) === "[object String]" &&
            account.length > 21 && /^blacknet[a-z0-9]{59}$/.test(account)) {
            return true
        }
        return false
    }
    
    Blacknet.verifyAmount = function (amount) {
        if (/\d+/.test(amount) && amount > 0) {
            return true
        }
        return false
    }
    
    Blacknet.verifyMessage = function (message) {
        if (Object.prototype.toString.call(message) === "[object String]" && message.length > 0) {
            return true
        }
        return false
    }
    

    Blacknet.verifySign = function (sign) {
        if (Object.prototype.toString.call(sign) === "[object String]" && sign.length === 128) {
            return true
        }
        return false
    }
    
    Blacknet.verifyNetworkAddress = function (address) {
        // ipv4 | ipv6 | tor | i2p
        if (Object.prototype.toString.call(address) === "[object String]" &&
            address.length >= 7 && address.length <= 70) {
            return true
        }
        return false
    }
    
    Blacknet.verifyNetworkPort = function (port) {
        if (/\d+/.test(port) && port >= 0 && port <= 65535) {
            return true
        }
        return false
    }

    Blacknet.confirm = function (text, fn) {
        mask.show();
        dialogConfirm.find(".body").html(text.replace(/\n/g, "<br/>"))
        dialogConfirm.show().find('.confirm, .cancel').unbind().on('click', function () {
            if (Object.prototype.toString.call(fn) === "[object Function]") {
                fn.call(this, $(this).hasClass("confirm"));
            }
            if (!dialogPassword.is(":visible")) {
                mask.hide();
            }
            dialogConfirm.hide().find('.confirm,.cancel').unbind();
        });
    }

    Blacknet.message = function (msg, type, duration) {
        if (window.i18nData && window.i18nData[msg.toLocaleLowerCase()]) {
            msg = window.i18nData[msg.toLocaleLowerCase()]
        }
        Blacknet.template.message(msg, type, duration)
    }

    window.addEventListener('beforeunload', function (e) {

        if (window.isGenerated) {

            e.preventDefault();
            e.returnValue = '';
        }
    });


    Blacknet.init();

    window.Blacknet = Blacknet;
}();