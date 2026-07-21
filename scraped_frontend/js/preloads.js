
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.CA1Se9kg.js","/cdn/shopifycloud/checkout-web/assets/c1/app.BulqsOFB.js","/cdn/shopifycloud/checkout-web/assets/c1/esnext-vendor.DSOfBTK2.js","/cdn/shopifycloud/checkout-web/assets/c1/context-browser.BBW9J1ww.js","/cdn/shopifycloud/checkout-web/assets/c1/NotFound.nciatbsj.js","/cdn/shopifycloud/checkout-web/assets/c1/types-UnauthenticatedErrorModalPayload.BmL93RLG.js","/cdn/shopifycloud/checkout-web/assets/c1/images-payment-icon.BfafdrDF.js","/cdn/shopifycloud/checkout-web/assets/c1/FullScreenBackground.B-DrtWrg.js","/cdn/shopifycloud/checkout-web/assets/c1/helpers-userPrivacySettingsExperimentConsent.h6CDa15Q.js","/cdn/shopifycloud/checkout-web/assets/c1/phone-phoneCountryCode.i92ViMPv.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayCheckoutGqlVersion.B52aZf6o.js","/cdn/shopifycloud/checkout-web/assets/c1/shared-unactionable-errors.BNBFdeT6.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-getCommonShopPayExternalTelemetryAttributes.D1urGNUL.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-ShopPayCheckoutSessionQuery.D3ZJOXzg.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-UserPrivacySettingsSetMutation.C3Kmayj0.js","/cdn/shopifycloud/checkout-web/assets/c1/hydrate.Doy0bVKk.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-en.BKTxP-XF.js","/cdn/shopifycloud/checkout-web/assets/c1/page-OnePage.Drat37BW.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useWalletsTimeout.1BGleg4K.js","/cdn/shopifycloud/checkout-web/assets/c1/remember-me-hooks.BL7BwrTV.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useStableHostMethodsReferences.ClSCfdMm.js","/cdn/shopifycloud/checkout-web/assets/c1/MarketsProDisclaimer.BAiTOjxN.js","/cdn/shopifycloud/checkout-web/assets/c1/SplitDeliveryMerchandiseContainer.CG7pDkkP.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayButtonClassName.BRDGkDXo.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useCheckoutProtocolDarkTheme.wXiAM_55.js","/cdn/shopifycloud/checkout-web/assets/c1/ChangeCompanyLocationLink.DQ4Hm5Zf.js","/cdn/shopifycloud/checkout-web/assets/c1/WalletsSandbox-WalletSandbox.DGhqhCq0.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressForm.CTCPzT7o.js","/cdn/shopifycloud/checkout-web/assets/c1/PhoneField.C8ZVCbLe.js","/cdn/shopifycloud/checkout-web/assets/c1/images-flag-icon.C_eXYJRt.js","/cdn/shopifycloud/checkout-web/assets/c1/types-index.BlKBgLPd.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useForceShopPayUrl.CaRbInLG.js","/cdn/shopifycloud/checkout-web/assets/c1/ButtonWithRegisterWebPixel.CaUjmQJY.js","/cdn/shopifycloud/checkout-web/assets/c1/GooglePayButton-index.DfOcm9Jr.js","/cdn/shopifycloud/checkout-web/assets/c1/PendingShipping.BkSJ8XSn.js","/cdn/shopifycloud/checkout-web/assets/c1/ImpressionEventCapture.-LZZsCUq.js","/cdn/shopifycloud/checkout-web/assets/c1/AutocompleteField-hooks.kbZNjHmf.js","/cdn/shopifycloud/checkout-web/assets/c1/LocalizationExtensionField.DKoL0pCD.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUpdateCheckoutAddress.C-Aubm90.js","/cdn/shopifycloud/checkout-web/assets/c1/billing-address-hooks.CafCCnyh.js","/cdn/shopifycloud/checkout-web/assets/c1/WalletLogo.DTrwYsMS.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useGeneralPaymentErrorMessage.DRcqRHT0.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShowShopPayOptin.Cqqx5T9I.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShowCreateMoreAccountsGdprTreatment.B0zwmlbi.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentLine.2wqbmrip.js","/cdn/shopifycloud/checkout-web/assets/c1/Section.Kqv9txi1.js","/cdn/shopifycloud/checkout-web/assets/c1/MobileOrderSummary.C7N06elM.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useOnePageFormSubmit.BOWyayxb.js","/cdn/shopifycloud/checkout-web/assets/c1/PayPalOverCaptureInfoBanner.B1QNsqrk.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-get-negotiation-input.CJKFqpF0.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayPaymentRequiredMethod.D71r90RS.js","/cdn/shopifycloud/checkout-web/assets/c1/NoAddressLocationFullDetour.kWopSz7C.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopCashCheckoutEligibility.i0POOGQV.js","/cdn/shopifycloud/checkout-web/assets/c1/redemption-constants.Cu2A-vp8.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressSelector.tbYiVVw8.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentErrorBanner.BdN5hY8k.js","/cdn/shopifycloud/checkout-web/assets/c1/StockProblems-StockProblemsLineItemList.B7sLI-QZ.js","/cdn/shopifycloud/checkout-web/assets/c1/DutyOptions.BN3dTldS.js","/cdn/shopifycloud/checkout-web/assets/c1/ShipmentBreakdown.DMB0a0_a.js","/cdn/shopifycloud/checkout-web/assets/c1/MerchandiseModal.CWu37BYt.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-shipping-options.BQ7tDRiT.js","/cdn/shopifycloud/checkout-web/assets/c1/DeliveryExpectationMethodLabel.Dp98Z9sR.js","/cdn/shopifycloud/checkout-web/assets/c1/EstimatedDeliveryContent.BwYqjCJ4.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingMethodSelector.CNxrOUxo.js","/cdn/shopifycloud/checkout-web/assets/c1/SubscriptionPriceBreakdown.DBlhbEig.js","/cdn/shopifycloud/checkout-web/assets/c1/DeliveryMethodLineFact.BLhkhx_C.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingGroupsSummaryLine.Bpyv6Kyl.js","/cdn/shopifycloud/checkout-web/assets/c1/assets-index.DNK6G_4L.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.CyU64bGt.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/NotFound.C-ppsiYq.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/UnauthenticatedErrorModalPayload.BmzyrTr0.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/FullScreenBackground.B_iZlQze.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useUnauthenticatedErrorModal.BK_OA6Y4.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage.CqQsGb7U.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/SplitDeliveryMerchandiseContainer.B4YRyik9.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/LocalizationExtensionField.Dou76fd3.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MobileOrderSummary.CqVkJv9Z.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useOnePageFormSubmit.BRUjVIS4.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/WalletLogo.CIy8uDiZ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ChangeCompanyLocationLink.uqpm88mq.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Section.CU18S7Ap.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayButtonClassName.BrcQzLuH.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/DutyOptions.LcqrKXE1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/BillingAddressForm.Dj0n4Opx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PhoneField.CtVCy8Ci.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/DeliveryExpectationMethodLabel.D6OuIVjc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/EstimatedDeliveryContent.Dl_bEC_c.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PayPalOverCaptureInfoBanner.CuS5ve3d.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ButtonWithRegisterWebPixel.0LqF4awG.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/WalletSandbox.CnR7qNLY.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShippingMethodSelector.B0hio2RO.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/SubscriptionPriceBreakdown.BSemv9tH.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/NoAddressLocationFullDetour.CpFaJIpx.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = [];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = preconnectOrigins.concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  