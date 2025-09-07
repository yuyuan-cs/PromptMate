import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { QrCode, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 导入静态资源
import qrWechat from '/images/qr-wechat.png';
import qrAlipay from '/images/qr-alipay.png';

interface QRCodeData {
  type: 'wechat' | 'alipay';
  title: string;
  imageUrl?: string;
  placeholder?: string;
}

interface SponsorQRCodeProps {
  className?: string;
}

export const SponsorQRCode: React.FC<SponsorQRCodeProps> = ({ className }) => {
  const { t } = useTranslation();
  const [showQR, setShowQR] = useState(false);

  // 二维码数据 - 使用导入的静态资源
  const qrCodes: QRCodeData[] = [
    {
      type: 'wechat',
      title: t('about.support.qr.wechat'),
      imageUrl: qrWechat,
      placeholder: '微信二维码'
    },
    {
      type: 'alipay',
      title: t('about.support.qr.alipay'),
      imageUrl: qrAlipay,
      placeholder: '支付宝二维码'
    }
  ];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // 如果图片加载失败，显示占位符
    console.error('二维码图片加载失败:', e.currentTarget.src);
    e.currentTarget.style.display = 'none';
    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('二维码图片加载成功:', e.currentTarget.src);
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium">{t('about.support.qr.title')}</Label>
      <div className="mt-2 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-center space-x-4">
          {qrCodes.map((qr) => (
            <div key={qr.type} className="text-center">
              <div className="w-32 h-32 bg-white border rounded-lg flex items-center justify-center mb-2 relative">
                {showQR && qr.imageUrl ? (
                  <>
                    <img
                      src={qr.imageUrl}
                      alt={qr.placeholder}
                      className="w-full h-full object-contain rounded"
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                    <div
                      className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-xs"
                      style={{ display: 'none' }}
                    >
                      <QrCode className="h-8 w-8" />
                    </div>
                  </>
                ) : (
                    <QrCode className="h-20 w-20 text-gray-400" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{qr.title}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQR(!showQR)}
            className="text-xs"
          >
            {showQR ? (
              <>
                <EyeOff className="mr-1 h-3 w-3" />
                隐藏二维码
              </>
            ) : (
              <>
                <Eye className="mr-1 h-3 w-3" />
                显示二维码
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-2">
          {t('about.support.qr.note')}
        </p>
        
        {/* 调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p className="text-yellow-800 font-medium">调试信息:</p>
            <p className="text-yellow-700">微信二维码路径: {qrWechat}</p>
            <p className="text-yellow-700">支付宝二维码路径: {qrAlipay}</p>
            <p className="text-yellow-700">使用静态资源导入，Vite会自动处理路径</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorQRCode;
