import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import db from '@/db/db';
import { formatCurrency, formatNumber } from '@/lib/formatters';

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });

  await wait(2000);

  return {
    amount: (data._sum.pricePaidInCents ?? 0) / 100,
    numberOfSales: data._count,
  };
}

function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function getUserData() {
  const [userCount, orderSum] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);

  return {
    userCount,
    averageValuePerUser: userCount === 0 ? 0 : (orderSum._sum.pricePaidInCents ?? 0) / userCount / 100,
  };
}

async function getProductData() {
  const [activeCount, inActiveCount] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } }),
  ]);

  return {
    activeCount,
    inActiveCount,
  };
}

async function AdminDashboard() {
  const [salesData, usereData, productData] = await Promise.all([getSalesData(), getUserData(), getProductData()]);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      <DashboardCard
        title='Sales'
        subTitle={`${formatNumber(salesData.numberOfSales)} Orders`}
        body={formatCurrency(salesData.numberOfSales)}
      />
      <DashboardCard
        title='Customer'
        subTitle={`${formatCurrency(usereData.averageValuePerUser)} Average Value`}
        body={formatNumber(usereData.userCount)}
      />
      <DashboardCard
        title='Active Products'
        subTitle={`${formatNumber(productData.inActiveCount)} Inactive`}
        body={formatNumber(productData.activeCount)}
      />
    </div>
  );
}

export default AdminDashboard;

type DashboardCardProps = {
  title: string;
  subTitle: string;
  body: string;
};

function DashboardCard({ title, subTitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subTitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}
