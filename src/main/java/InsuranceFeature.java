public class InsuranceFeature extends CardDecorator {
    public InsuranceFeature(Card card) {
        super(card);
    }

    @Override
    public String getInfo() {
        return super.getInfo() + ", Страховой полис";
    }
}
